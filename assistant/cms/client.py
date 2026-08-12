from typing import TypeVar
from httpx import AsyncClient
from pydantic import BaseModel
from config import settings
from models import StrapiResponse, LLMSettings

T = TypeVar("T")


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
        response = await self.client.get(endpoint)
        response.raise_for_status()
        return response_model.model_validate(response.json())

    async def get_model_settings(self) -> StrapiResponse[LLMSettings]:
        response = await self.get(
            "/llm-setting?populate=*", StrapiResponse[LLMSettings]
        )
        return response

    async def close_client(self):
        await self.client.aclose()


strapi_client = StrapiClient()
