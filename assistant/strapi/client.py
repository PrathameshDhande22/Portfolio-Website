import logging
from typing import List, Literal, Optional, TypeVar, Union
from httpx import AsyncClient, QueryParams
from pydantic import BaseModel
from config import settings
from models import (
    StrapiResponse,
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
)

T = TypeVar("T")

logger = logging.getLogger(__name__)


class StrapiClient:
    def __init__(self):
        self.client = AsyncClient(
            base_url=settings.strapi_api_url,
            headers={"Authorization": f"Bearer {settings.strapi_auth_token}"},
            timeout=10.0,
        )

    def get_client(self):
        return self.client

    async def get(
        self,
        endpoint: str,
        response_model: type[T] | BaseModel,
        params: dict[str, Union[str, list[str]]] = None,
    ) -> T:
        logger.info("Call the endpoint=%s", endpoint)
        query_params = QueryParams(params)
        response = await self.client.get(endpoint, params=query_params)
        response.raise_for_status()
        return response_model.model_validate(response.json())

    async def get_model_settings(self) -> StrapiResponse[LLMSettings]:
        return await self.get(
            "/llm-setting",
            StrapiResponse[LLMSettings],
            {"populate": "*"},
        )

    async def get_skills(
        self,
        by: Literal["Category", "Skills"] = "Skills",
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Skill]] | StrapiResponse[List[SkillCategory]]:
        if by == "Category":
            params = {"populate": "*"}
            if name:
                params["filters[Name][$containsi]"] = name
            return await self.get(
                "/skill-categories", StrapiResponse[List[SkillCategory]], params
            )
        else:
            params = {"populate": "*"}
            if name:
                params["filters[Name][$containsi]"] = name
            return await self.get("/skills", StrapiResponse[List[Skill]], params)

    async def get_projects(
        self,
        tag: Optional[str] = None,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Project]]:
        params = {
            "populate[Tags][populate]": "*",
            "populate[Links][populate]": "*",
        }
        if tag:
            params["filters[Tags][Tag][$containsi]"] = tag
        if name:
            params["filters[Title][$containsi]"] = name
        return await self.get("/projects", StrapiResponse[List[Project]], params)

    async def get_education(self) -> StrapiResponse[List[Education]]:
        return await self.get(
            "/educations",
            StrapiResponse[List[Education]],
            {"populate[Timeline][populate]": "*"},
        )

    async def get_certifications(
        self,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Certification]]:
        params = {"populate[VerifyLink][populate]": "*"}
        if name:
            params["filters[$or][0][Title][$containsi]"] = name
            params["filters[$or][1][Certifier][$containsi]"] = name
        return await self.get(
            "/certifications", StrapiResponse[List[Certification]], params
        )

    async def get_timeline(self) -> StrapiResponse[List[TimeLine]]:
        return await self.get(
            "/time-lines",
            StrapiResponse[List[TimeLine]],
            {"populate[Timeline][populate]": "*"},
        )

    async def get_experiences(
        self,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Experience]]:
        params = {"populate[Experience][populate]": "*"}
        if name:
            params["filters[$or][0][Experience][Title][$containsi]"] = name
            params["filters[$or][1][Experience][SubTitle][$containsi]"] = name
        return await self.get("/experiences", StrapiResponse[List[Experience]], params)

    async def get_page(self, slug: str) -> StrapiResponse[List[Page]]:
        params = {
            "filters[Slug][$eq]": slug,
            "populate[SEO][populate]": "*",
            "populate[Content][populate]": "*",
        }
        return await self.get("/page", StrapiResponse[List[Page]], params)

    async def get_site_settings(self) -> StrapiResponse[SiteSettings]:
        params = {
            "populate[SocialLinks][populate]": "*",
            "populate[Navigation][populate]": "*",
            "populate[Footer][populate]": "*",
            "populate[AskAI][populate]": "*",
        }
        return await self.get("/site-setting", StrapiResponse[SiteSettings], params)

    async def get_ai_knowledge(self) -> StrapiResponse[List[AIKnowledge]]:
        return await self.get(
            "/ai-knowledges", StrapiResponse[List[AIKnowledge]], {"populate": "*"}
        )

    async def close_client(self):
        await self.client.aclose()


strapi_client = StrapiClient()
