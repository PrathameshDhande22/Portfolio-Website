import asyncio
import logging
from typing import Any, AsyncIterator, Dict, List, Optional
from uuid import UUID, uuid4

from fastapi.sse import ServerSentEvent
from langchain.chat_models import BaseChatModel
from langchain_core.messages import AIMessageChunk, HumanMessage, SystemMessage
from langchain_core.runnables import (
    Runnable,
    RunnableConfig,
    RunnableBranch,
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)

from db import ChatUsage, session_scope
from embedding import get_vector_store
from llm import get_llm_provider
from models import (
    ChatMessage,
    ChatRequest,
    ChatStage,
    DeltaEvent,
    DoneEvent,
    ErrorEvent,
    LLMSettings,
    MetaEvent,
    ModelConfiguration,
    PlanEvent,
    PlannerDecision,
    RetrievalFilter,
    RetrievalSource,
    RetrievedContext,
    SemanticQuery,
    UsageEvent,
)
from strapi import strapi_client

logger = logging.getLogger(__name__)

HISTORY_TURNS = 6
SEMANTIC_K = 6


async def stream_chat(request: ChatRequest) -> AsyncIterator[ServerSentEvent]:
    thread_id = request.thread_id or uuid4()
    logger.info(
        "Chat started thread_id=%s messages=%d", thread_id, len(request.messages)
    )
    yield ServerSentEvent(event="meta", data=MetaEvent(thread_id=thread_id))

    try:
        model_settings = await strapi_client.get_model_settings()
        chain = await _build_chain(model_settings.data)

        history = request.messages[:-1][-HISTORY_TURNS:]
        payload = {
            "history": _render_history(history),
            "question": request.messages[-1].content,
        }
        config = {"configurable": {"thread_id": str(thread_id)}, "run_name": "chat"}

        action = "respond"
        planner_output: Any = None

        async for event in chain.astream_events(payload, config=config, version="v2"):
            name = event["event"]
            tags = event.get("tags") or []
            data = event.get("data") or {}

            if name == "on_chat_model_end" and "planner" in tags:
                planner_output = data.get("output")

            elif name == "on_chain_end" and event["name"] == "plan":
                plan: PlannerDecision = data["output"]
                action = plan.action
                logger.info(
                    "Planner decided thread_id=%s action=%s sources=%s semantic=%s question=%r",
                    thread_id,
                    plan.action,
                    [query.source for query in plan.structured],
                    plan.semantic.enabled,
                    plan.question,
                )
                yield ServerSentEvent(
                    event="plan",
                    data=PlanEvent(
                        action=plan.action,
                        question=plan.question,
                        sources=[query.source for query in plan.structured],
                        semantic=plan.semantic.enabled,
                    ),
                )

                usage = await _record_usage(
                    thread_id,
                    ChatStage.PLANNER,
                    model_settings.data,
                    planner_output,
                    action,
                )
                if usage:
                    yield ServerSentEvent(event="usage", data=usage)

            elif name == "on_chain_end" and event["name"] == "context":
                context: RetrievedContext = data["output"]
                logger.info(
                    "Context built thread_id=%s sources=%s chunks=%s characters=%d",
                    thread_id,
                    context.sources,
                    context.chunk_ids,
                    len(context.markdown),
                )

            elif name == "on_chain_end" and event["name"] == "refusal":
                message: AIMessageChunk = data["output"]
                yield ServerSentEvent(
                    event="delta", data=DeltaEvent(content=message.content)
                )

            elif name == "on_chat_model_stream" and "answer" in tags:
                chunk: AIMessageChunk = data["chunk"]
                if chunk.content:
                    yield ServerSentEvent(
                        event="delta", data=DeltaEvent(content=chunk.content)
                    )

            elif name == "on_chat_model_end" and "answer" in tags:
                usage = await _record_usage(
                    thread_id,
                    ChatStage.ANSWER,
                    model_settings.data,
                    data.get("output"),
                    action,
                )
                if usage:
                    yield ServerSentEvent(event="usage", data=usage)

        logger.info("Chat finished thread_id=%s action=%s", thread_id, action)
        yield ServerSentEvent(
            event="done", data=DoneEvent(thread_id=thread_id, action=action)
        )

    except asyncio.CancelledError:
        logger.info("Chat cancelled by the client thread_id=%s", thread_id)
        raise
    except Exception as e:
        logger.error(
            "Chat failed thread_id=%s error=%s", thread_id, str(e), exc_info=True
        )
        yield ServerSentEvent(
            event="error",
            data=ErrorEvent(message="The assistant could not answer that right now."),
        )


async def _build_chain(settings: LLMSettings) -> Runnable:
    planner_model = _chat_model(settings.Planner, disable_streaming=True)
    answer_model = _chat_model(settings.Response)
    store = await get_vector_store()
    retriever = store.as_retriever(search_kwargs={"k": SEMANTIC_K})

    structured_planner = planner_model.with_structured_output(
        PlannerDecision, include_raw=True
    )

    async def make_plan(
        payload: Dict[str, Any], config: RunnableConfig
    ) -> PlannerDecision:
        messages = [
            SystemMessage(content=settings.Planner.SystemPrompt),
            HumanMessage(
                content=(
                    f"Conversation so far:\n{payload['history']}\n\n"
                    f"Latest question:\n{payload['question']}"
                )
            ),
        ]
        result = await structured_planner.ainvoke(messages, config=config)

        plan = result.get("parsed")
        if plan is None:
            logger.warning(
                "Planner returned an unusable plan error=%s, falling back to semantic search",
                result.get("parsing_error"),
            )
            question = payload["question"]
            return PlannerDecision(
                action="retrieve",
                question=question,
                semantic=SemanticQuery(enabled=True, query=question),
            )
        return plan

    async def fetch_structured(payload: Dict[str, Any]) -> List[str]:
        queries = payload["plan"].structured
        if not queries:
            return []
        logger.info("Reading collections=%s", [query.source for query in queries])
        rendered = await asyncio.gather(
            *(_fetch_source(query.source, query.filters) for query in queries),
            return_exceptions=True,
        )

        sections: List[str] = []
        for query, section in zip(queries, rendered):
            if isinstance(section, Exception):
                logger.error(
                    "Failed to read source=%s error=%s",
                    query.source,
                    str(section),
                    exc_info=section,
                )
            elif section:
                sections.append(section)
        return sections

    async def search_semantic(payload: Dict[str, Any]) -> List[Any]:
        semantic = payload["plan"].semantic
        if not semantic.enabled:
            logger.info("Semantic search is disabled for this question")
            return []

        query = semantic.query or payload["plan"].question
        logger.info("Semantic search query=%r k=%d", query, SEMANTIC_K)
        documents = await retriever.ainvoke(query)
        logger.info("Semantic search returned documents=%d", len(documents))
        return documents

    def build_context(retrieved: Dict[str, Any]) -> RetrievedContext:
        sections: List[str] = list(retrieved["structured"])
        documents = retrieved["semantic"]

        if documents:
            passages = "\n\n".join(document.page_content for document in documents)
            sections.append(f"## Reference material\n\n{passages}")

        return RetrievedContext(
            markdown="\n\n".join(sections) or "No portfolio data matched this question.",
            sources=[section.splitlines()[0].lstrip("# ") for section in sections],
            chunk_ids=[document.id for document in documents if document.id],
        )

    def answer_messages(payload: Dict[str, Any]) -> List[Any]:
        return [
            SystemMessage(content=settings.Response.SystemPrompt),
            HumanMessage(
                content=(
                    f"Context:\n\n{payload['context'].markdown}\n\n"
                    f"Conversation so far:\n{payload['history']}\n\n"
                    f"Question:\n{payload['plan'].question}"
                )
            ),
        ]

    planner = RunnableLambda(make_plan).with_config(run_name="plan", tags=["planner"])

    answer = (
        RunnablePassthrough.assign(
            context=RunnableParallel(
                structured=RunnableLambda(fetch_structured),
                semantic=RunnableLambda(search_semantic),
            )
            | RunnableLambda(build_context).with_config(run_name="context")
        )
        | RunnableLambda(answer_messages)
        | answer_model.with_config(tags=["answer"])
    )

    refusal = RunnableLambda(
        lambda payload: AIMessageChunk(content=payload["plan"].message)
    ).with_config(run_name="refusal")

    return RunnablePassthrough.assign(plan=planner) | RunnableBranch(
        (lambda payload: payload["plan"].action == "respond", refusal),
        answer,
    )


async def _fetch_source(source: RetrievalSource, filters: RetrievalFilter) -> str:
    logger.info("Reading source=%s filters=%s", source, filters.model_dump(exclude_none=True))

    match source:
        case "skills":
            if filters.name:
                response = await strapi_client.get_skills(by="Skills", name=filters.name)
                names = ", ".join(skill.Name for skill in response.data)
                return f"## Skills\n\n{names}" if names else ""

            response = await strapi_client.get_skills(by="Category", name=filters.category)
            lines = ["## Skills"]
            for category in response.data:
                if not category.Visible:
                    continue
                names = ", ".join(skill.Name for skill in category.Skills or [])
                lines.append(f"\n### {category.Name}\n\n{names or 'None listed'}")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "projects":
            response = await strapi_client.get_projects(
                tag=filters.tag, name=filters.name, category=filters.category
            )
            lines = ["## Projects"]
            for project in response.data:
                lines.append(f"\n### {project.Title}")
                lines.append(f"\nCategory: {project.Category}")
                years = " to ".join(
                    str(year.year) for year in (project.StartYear, project.EndYear) if year
                )
                if years:
                    lines.append(f"Years: {years}")
                lines.append(f"\n{project.Description}")
                technologies = ", ".join(
                    tag.Tag or (tag.Technology.Name if tag.Technology else "")
                    for tag in project.Tags or []
                )
                if technologies:
                    lines.append(f"\nTechnologies: {technologies}")
                for link in project.Links or []:
                    lines.append(f"Link: [{link.Text}]({link.Url})")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "experience":
            response = await strapi_client.get_experiences(name=filters.name)
            return _render_timelines(
                "Experience", [entry.Experience for entry in response.data]
            )

        case "education":
            response = await strapi_client.get_education()
            return _render_timelines(
                "Education", [entry.Timeline for entry in response.data]
            )

        case "timeline":
            response = await strapi_client.get_timeline()
            return _render_timelines(
                "Timeline", [entry.Timeline for entry in response.data]
            )

        case "certifications":
            response = await strapi_client.get_certifications(name=filters.name)
            lines = ["## Certifications"]
            for certification in response.data:
                lines.append(f"\n### {certification.Title}")
                if certification.Certifier:
                    lines.append(f"\nIssued by: {certification.Certifier}")
                if certification.Issued:
                    lines.append(f"Issued: {certification.Issued.isoformat()}")
                if certification.Expires:
                    lines.append(f"Expires: {certification.Expires.isoformat()}")
                if certification.Description:
                    lines.append(f"\n{certification.Description}")
                if certification.VerifyLink:
                    lines.append(f"\nVerify: {certification.VerifyLink.Url}")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "blogs":
            response = await strapi_client.get_blogs(name=filters.name)
            lines = ["## Blog articles"]
            for blog in response.data:
                lines.append(f"\n### {blog.Title}")
                if blog.Description:
                    lines.append(f"\n{blog.Description}")
                lines.append(f"\nSlug: {blog.Slug}")
            return "\n".join(lines) if len(lines) > 1 else ""

        case "site":
            response = await strapi_client.get_site_settings()
            site = response.data
            lines = [
                "## Site",
                f"\nName: {site.SiteName}",
                f"Designation: {site.Designation}",
                f"Location: {site.Location}",
                f"Email: {site.Email}",
            ]
            if site.AvailabilityStatus:
                lines.append(f"Availability: {site.AvailabilityStatus}")
            if site.Resume:
                lines.append(f"Resume: {site.Resume}")
            for link in site.SocialLinks or []:
                if link.Visible:
                    lines.append(f"{link.Platform}: {link.Url}")
            return "\n".join(lines)

        case _:
            logger.warning("Unknown source=%s requested by the planner", source)
            return ""


def _render_timelines(heading: str, timelines: List[Any]) -> str:
    lines = [f"## {heading}"]
    for timeline in timelines:
        if timeline is None:
            continue
        title = timeline.Title
        if timeline.SubTitle:
            title = f"{title} - {timeline.SubTitle}"
        lines.append(f"\n### {title}")
        if timeline.ShortTitle:
            lines.append(f"\n{timeline.ShortTitle}")
        if timeline.Description:
            lines.append(f"\n{timeline.Description}")
        badges = ", ".join(
            badge.Skill.Name for badge in timeline.Badges or [] if badge.Skill
        )
        if badges:
            lines.append(f"\nSkills: {badges}")
    return "\n".join(lines) if len(lines) > 1 else ""


def _render_history(messages: List[ChatMessage]) -> str:
    if not messages:
        return "No earlier turns."
    return "\n".join(f"{message.role}: {message.content}" for message in messages)


async def _record_usage(
    thread_id: UUID,
    stage: ChatStage,
    settings: LLMSettings,
    output: Any,
    action: str,
) -> Optional[UsageEvent]:
    usage = getattr(output, "usage_metadata", None) if output else None
    if not usage:
        logger.warning("No usage metadata reported for stage=%s", stage.value)
        return None

    config: ModelConfiguration = (
        settings.Planner if stage == ChatStage.PLANNER else settings.Response
    )
    record = ChatUsage(
        thread_id=thread_id,
        stage=stage,
        connector=config.Connector,
        model=config.Model_Name,
        input_tokens=usage.get("input_tokens", 0),
        output_tokens=usage.get("output_tokens", 0),
        total_tokens=usage.get("total_tokens", 0),
        action=action,
    )

    async with session_scope() as session:
        session.add(record)
        await session.commit()

    logger.info(
        "Usage thread_id=%s stage=%s model=%s input=%d output=%d total=%d",
        thread_id,
        stage.value,
        config.Model_Name,
        record.input_tokens,
        record.output_tokens,
        record.total_tokens,
    )
    return UsageEvent(
        stage=stage,
        model=config.Model_Name,
        input_tokens=record.input_tokens,
        output_tokens=record.output_tokens,
        total_tokens=record.total_tokens,
    )


def _chat_model(
    config: ModelConfiguration, disable_streaming: bool = False
) -> BaseChatModel:
    return get_llm_provider(
        provider_name=config.Connector,
        model_name=config.Model_Name,
        temperature=config.Temperature,
        max_tokens=config.MaxTokens or 1024,
        base_url=config.BaseURL,
        disable_streaming=disable_streaming,
    )


