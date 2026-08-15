import logging
from typing import List, Literal, Optional, TypeVar
from httpx import AsyncClient
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

    async def get(self, endpoint: str, response_model: type[T] | BaseModel) -> T:
        logger.info("Call the endpoint=%s", endpoint)
        response = await self.client.get(endpoint)
        response.raise_for_status()
        return response_model.model_validate(response.json())

    async def get_model_settings(self) -> StrapiResponse[LLMSettings]:
        response = await self.get(
            "/llm-setting?populate=*", StrapiResponse[LLMSettings]
        )
        return response

    async def get_skills(
        self,
        by: Literal["Category", "Skills"] = "Skills",
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Skill]] | StrapiResponse[List[SkillCategory]]:
        if by == "Category":
            qs = "/skill-categories?populate=*"
            if name:
                qs += f"&filters[Name][$containsi]={name}"
            return await self.get(qs, StrapiResponse[List[SkillCategory]])
        else:
            qs = "/skills?populate=*"
            if name:
                qs += f"&filters[Name][$containsi]={name}"
            return await self.get(qs, StrapiResponse[List[Skill]])

    async def get_projects(
        self,
        tag: Optional[str] = None,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Project]]:
        qs = "/projects?populate[Tags][populate]=*&populate[Links][populate]=*"
        if tag:
            qs += f"&filters[Tags][Tag][$containsi]={tag}"
        if name:
            qs += f"&filters[Title][$containsi]={name}"
        return await self.get(qs, StrapiResponse[List[Project]])

    async def get_education(self) -> StrapiResponse[List[Education]]:
        return await self.get(
            "/educations?populate[Timeline][populate]=*",
            StrapiResponse[List[Education]],
        )

    async def get_certifications(
        self,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Certification]]:
        qs = "/certifications?populate[VerifyLink][populate]=*"
        if name:
            qs += f"&filters[$or][0][Title][$containsi]={name}"
            qs += f"&filters[$or][1][Certifier][$containsi]={name}"
        return await self.get(qs, StrapiResponse[List[Certification]])

    async def get_timeline(self) -> StrapiResponse[List[TimeLine]]:
        return await self.get(
            "/time-lines?populate[Timeline][populate]=*",
            StrapiResponse[List[TimeLine]],
        )

    async def get_experiences(
        self,
        name: Optional[str] = None,
    ) -> StrapiResponse[List[Experience]]:
        qs = "/experiences?populate[Experience][populate]=*"
        if name:
            qs += f"&filters[$or][0][Experience][Title][$containsi]={name}"
            qs += f"&filters[$or][1][Experience][SubTitle][$containsi]={name}"
        return await self.get(qs, StrapiResponse[List[Experience]])

    async def get_page(self, slug: str) -> StrapiResponse[List[Page]]:
        qs = (
            f"/page?filters[Slug][$eq]={slug}"
            "&populate[SEO][populate]=*"
            "&populate[Content][populate]=*"
        )
        return await self.get(qs, StrapiResponse[List[Page]])

    async def get_site_settings(self) -> StrapiResponse[SiteSettings]:
        return await self.get(
            "/site-setting"
            "?populate[SocialLinks][populate]=*"
            "&populate[Navigation][populate]=*"
            "&populate[Footer][populate]=*"
            "&populate[AskAI][populate]=*",
            StrapiResponse[SiteSettings],
        )

    async def close_client(self):
        await self.client.aclose()


strapi_client = StrapiClient()
