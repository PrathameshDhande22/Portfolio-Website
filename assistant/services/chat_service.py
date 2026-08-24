import asyncio
import logging
from typing import Any, AsyncIterator, Dict, List, Optional
from uuid import UUID, uuid4

from fastapi.sse import ServerSentEvent
from langchain.messages import AIMessage, AIMessageChunk, HumanMessage
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import (
    Runnable,
    RunnableBranch,
    RunnableConfig,
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)

from db import ChatUsage, session_scope
from embedding import get_vector_store
from llm import get_chat_model
from models import (
    ChatRequest,
    ChatStage,
    ChatState,
    DeltaEvent,
    DoneEvent,
    ErrorEvent,
    LLMSettings,
    MetaEvent,
    ModelConfiguration,
    PlanEvent,
    PlannedState,
    PlannerDecision,
    PromptState,
    RetrievedState,
    SemanticQuery,
    UsageEvent,
)
from strapi import strapi_client

from .context_service import fetch_source

logger = logging.getLogger(__name__)


async def stream_chat(request: ChatRequest) -> AsyncIterator[ServerSentEvent]:
    thread_id = request.thread_id or uuid4()
    logger.info(
        "Chat started thread_id=%s messages=%d", thread_id, len(request.messages)
    )
    yield ServerSentEvent(event="meta", data=MetaEvent(thread_id=thread_id))

    try:
        settings = (await strapi_client.get_model_settings()).data
        chain = await _build_chain(settings)

        recent = request.messages[-4:]
        payload: ChatState = {
            "history": [
                (
                    HumanMessage(content=message.content)
                    if message.role == "human"
                    else AIMessage(content=message.content)
                )
                for message in recent[:-1]
            ],
            "question": recent[-1].content,
        }

        action = "respond"
        planner_message: Any = None

        async for event in chain.astream_events(
            payload,
            config={"configurable": {"thread_id": str(thread_id)}, "run_name": "chat"},
            version="v2",
        ):
            kind, name = event["event"], event["name"]
            tags, data = event.get("tags") or [], event.get("data") or {}

            if kind == "on_chat_model_end" and "planner" in tags:
                planner_message = data.get("output")

            elif kind == "on_chain_end" and name == "plan":
                plan: PlannerDecision = data["output"]["plan"]
                action = plan.action
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
                    settings.Planner,
                    planner_message,
                    action,
                )
                if usage:
                    yield usage

            elif kind == "on_chain_end" and name == "refusal":
                yield ServerSentEvent(
                    event="delta", data=DeltaEvent(content=data["output"].content)
                )

            elif kind == "on_chat_model_stream" and "answer" in tags:
                if data["chunk"].content:
                    yield ServerSentEvent(
                        event="delta", data=DeltaEvent(content=data["chunk"].content)
                    )

            elif kind == "on_chat_model_end" and "answer" in tags:
                usage = await _record_usage(
                    thread_id,
                    ChatStage.ANSWER,
                    settings.Response,
                    data.get("output"),
                    action,
                )
                if usage:
                    yield usage

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


async def _build_chain(settings: LLMSettings) -> Runnable[ChatState, AIMessageChunk]:
    retriever = (await get_vector_store()).as_retriever(search_kwargs={"k": 6})

    planner_chain = _prompt(
        settings.Planner.SystemPrompt, "{question}"
    ) | get_chat_model(settings.Planner, disable_streaming=True).with_structured_output(
        PlannerDecision
    ).with_retry(
        stop_after_attempt=2
    )

    answer_chain = _prompt(
        settings.Response.SystemPrompt, "Context:\n\n{context}\n\nQuestion:\n{question}"
    ) | get_chat_model(settings.Response).with_config(tags=["answer"])

    async def plan(payload: ChatState, config: RunnableConfig) -> PlannedState:
        try:
            decision = await planner_chain.ainvoke(payload, config=config)
        except Exception as e:
            logger.warning("Planner failed error=%s", str(e))
            decision = None

        if decision is None:
            logger.warning(
                "Planner gave no usable plan, falling back to semantic search"
            )
            decision = PlannerDecision(
                action="retrieve",
                question=payload["question"],
                semantic=SemanticQuery(enabled=True, query=payload["question"]),
            )

        logger.info(
            "Planner decided action=%s sources=%s semantic=%s question=%r",
            decision.action,
            [query.source for query in decision.structured],
            decision.semantic.enabled,
            decision.question,
        )
        return {"history": payload["history"], "plan": decision}

    async def read_sources(state: PlannedState) -> List[str]:
        queries = state["plan"].structured
        if not queries:
            return []

        logger.info("Reading collections=%s", [query.source for query in queries])
        rendered = await asyncio.gather(
            *(fetch_source(query.source, query.filters) for query in queries),
            return_exceptions=True,
        )
        for query, section in zip(queries, rendered):
            if isinstance(section, Exception):
                logger.error("Failed to read source=%s", query.source, exc_info=section)
        return [section for section in rendered if isinstance(section, str) and section]

    async def search_knowledge(state: PlannedState) -> List[Document]:
        semantic = state["plan"].semantic
        if not semantic.enabled:
            logger.info("Semantic search is disabled for this question")
            return []

        documents = await retriever.ainvoke(semantic.query or state["plan"].question)
        logger.info(
            "Semantic search query=%r documents=%d ids=%s",
            semantic.query,
            len(documents),
            [document.id for document in documents],
        )
        return documents

    def refuse(state: PlannedState) -> AIMessageChunk:
        return AIMessageChunk(content=state["plan"].message)

    def is_refusal(state: PlannedState) -> bool:
        return state["plan"].action == "respond"

    def build_context(retrieved: RetrievedState) -> PromptState:
        sections = list(retrieved["sources"])
        if retrieved["documents"]:
            passages = "\n\n".join(
                document.page_content for document in retrieved["documents"]
            )
            sections.append(f"## Reference material\n\n{passages}")

        context = "\n\n".join(sections) or "No portfolio data matched this question."
        logger.info(
            "Context built sections=%d characters=%d", len(sections), len(context)
        )
        return {
            "history": retrieved["state"]["history"],
            "question": retrieved["state"]["plan"].question,
            "context": context,
        }

    return RunnableLambda(plan).with_config(
        run_name="plan", tags=["planner"]
    ) | RunnableBranch(
        (is_refusal, RunnableLambda(refuse).with_config(run_name="refusal")),
        RunnableParallel(
            state=RunnablePassthrough(),
            sources=RunnableLambda(read_sources),
            documents=RunnableLambda(search_knowledge),
        )
        | RunnableLambda(build_context)
        | answer_chain,
    )


def _prompt(system_prompt: str, human_template: str) -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages(
        [
            ("system", "{system_prompt}"),
            MessagesPlaceholder("history"),
            ("human", human_template),
        ]
    ).partial(system_prompt=system_prompt)


async def _record_usage(
    thread_id: UUID,
    stage: ChatStage,
    config: ModelConfiguration,
    message: Any,
    action: str,
) -> Optional[ServerSentEvent]:
    usage = getattr(message, "usage_metadata", None) if message else None
    if not usage:
        logger.warning("No usage metadata reported for stage=%s", stage.value)
        return None

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
    return ServerSentEvent(
        event="usage",
        data=UsageEvent(
            stage=stage,
            model=config.Model_Name,
            input_tokens=record.input_tokens,
            output_tokens=record.output_tokens,
            total_tokens=record.total_tokens,
        ),
    )
