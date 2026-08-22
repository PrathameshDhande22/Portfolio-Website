import logging
from typing import Any, Final, List, Literal, Optional, TypeAlias, TypeVar, Union
from httpx import AsyncClient, QueryParams
from pydantic import BaseModel
from config import settings
from models import (
    StrapiResponse,
    StrapiMeta,
    LLMSettings,
    SkillCategory,
    Skill,
    Project,
    Education,
    Certification,
    TimeLine,
    Experience,
    Page,
    SiteSettings,
    AIKnowledge,
    Blog,
    BlogContent,
)

ModelT = TypeVar("ModelT", bound=BaseModel)
ResponseT = TypeVar("ResponseT", bound=StrapiResponse)

Params: TypeAlias = dict[str, Union[str, List[str]]]

logger = logging.getLogger(__name__)

MAX_PAGE_SIZE: Final = 100
MAX_PAGES: Final = 100


class StrapiClient:
    def __init__(self) -> None:
        self.client = AsyncClient(
            base_url=settings.strapi_api_url,
            headers={"Authorization": f"Bearer {settings.strapi_auth_token}"},
            timeout=10.0,
        )

    def get_client(self) -> AsyncClient:
        return self.client

    async def get(
        self,
        endpoint: str,
        response_model: type[ModelT],
        params: Optional[Params] = None,
    ) -> ModelT:
        logger.info("Call the endpoint=%s", endpoint)
        query_params = QueryParams(params)
        response = await self.client.get(endpoint, params=query_params)
        response.raise_for_status()
        return response_model.model_validate(response.json())

    async def get_all(
        self,
        endpoint: str,
        response_model: type[ResponseT],
        params: Optional[Params] = None,
    ) -> ResponseT:
        page_params: Params = dict(params or {})
        page_params["pagination[pageSize]"] = str(MAX_PAGE_SIZE)

        items: List[Any] = []
        meta: StrapiMeta = StrapiMeta()
        page = 1

        while page <= MAX_PAGES:
            page_params["pagination[page]"] = str(page)
            response = await self.get(endpoint, response_model, page_params)

            items.extend(response.data)
            meta = response.meta

            page_count = meta.pagination.pageCount if meta.pagination else 1
            if page_count is None or page >= page_count:
                break
            page += 1

        logger.info("Fetched endpoint=%s pages=%d rows=%d", endpoint, page, len(items))
        return response_model(data=items, meta=meta)

    async def get_model_settings(self) -> StrapiResponse[LLMSettings]:
        params: Params = {"populate": "*"}
        return await self.get("/llm-setting", StrapiResponse[LLMSettings], params)

    async def get_skills(
        self,
        by: Literal["Category", "Skills"] = "Skills",
        name: Optional[str] = None,
    ) -> Union[StrapiResponse[List[Skill]], StrapiResponse[List[SkillCategory]]]:
        params: Params = {"populate": "*"}
        if name:
            params["filters[Name][$containsi]"] = name

        if by == "Category":
            return await self.get_all(
                "/skill-categories", StrapiResponse[List[SkillCategory]], params
            )
        return await self.get_all("/skills", StrapiResponse[List[Skill]], params)

    async def get_projects(
        self,
        tag: Optional[str] = None,
        name: Optional[str] = None,
        category: Optional[str] = None,
    ) -> StrapiResponse[List[Project]]:
        params: Params = {
            "populate[Tags][populate]": "*",
            "populate[Links][populate]": "*",
        }
        if tag:
            params["filters[Tags][Tag][$containsi]"] = tag
        if name:
            params["filters[Title][$containsi]"] = name
        if category:
            params["filters[Category][$containsi]"] = category
        return await self.get_all("/projects", StrapiResponse[List[Project]], params)

    async def get_education(self) -> StrapiResponse[List[Education]]:
        params: Params = {
            "populate[Timeline][populate][Badges][populate][Skill]": "true"
        }
        return await self.get_all(
            "/educations", StrapiResponse[List[Education]], params
        )

    async def get_certifications(
        self,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Certification]]:
        params: Params = {"populate[VerifyLink][populate]": "*"}
        if name:
            params["filters[$or][0][Title][$containsi]"] = name
            params["filters[$or][1][Certifier][$containsi]"] = name
        return await self.get_all(
            "/certifications", StrapiResponse[List[Certification]], params
        )

    async def get_timeline(self) -> StrapiResponse[List[TimeLine]]:
        params: Params = {
            "populate[Timeline][populate][Badges][populate][Skill]": "true"
        }
        return await self.get_all("/time-lines", StrapiResponse[List[TimeLine]], params)

    async def get_experiences(
        self,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Experience]]:
        params: Params = {
            "populate[Experience][populate][Badges][populate][Skill]": "true"
        }
        if name:
            params["filters[$or][0][Experience][Title][$containsi]"] = name
            params["filters[$or][1][Experience][SubTitle][$containsi]"] = name
        return await self.get_all(
            "/experiences", StrapiResponse[List[Experience]], params
        )

    async def get_page(self, slug: str) -> StrapiResponse[List[Page]]:
        params: Params = {
            "filters[Slug][$eq]": slug,
            "populate[SEO][populate]": "*",
            "populate[Content][populate]": "*",
        }
        return await self.get("/page", StrapiResponse[List[Page]], params)

    async def get_site_settings(self) -> StrapiResponse[SiteSettings]:
        params: Params = {
            "populate[SocialLinks][populate]": "*",
            "populate[Navigation][populate]": "*",
            "populate[Footer][populate]": "*",
            "populate[AskAI][populate]": "*",
        }
        return await self.get("/site-setting", StrapiResponse[SiteSettings], params)

    async def get_ai_knowledge(self) -> StrapiResponse[List[AIKnowledge]]:
        params: Params = {"populate": "*"}
        return await self.get_all(
            "/ai-knowledges", StrapiResponse[List[AIKnowledge]], params
        )

    async def get_blogs(
        self,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Blog]]:
        params: Params = {"populate": "*"}
        if name:
            params["filters[$or][0][Title][$containsi]"] = name
            params["filters[$or][1][Description][$containsi]"] = name
        return await self.get_all("/blogs", StrapiResponse[List[Blog]], params)

    async def get_blog_contents(self) -> StrapiResponse[List[BlogContent]]:
        params: Params = {"populate[Blog][populate][Skill][populate][Category]": "true"}
        return await self.get_all(
            "/blog-contents", StrapiResponse[List[BlogContent]], params
        )

    async def close_client(self) -> None:
        await self.client.aclose()


strapi_client = StrapiClient()
