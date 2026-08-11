from httpx import AsyncClient
from config import settings

client = AsyncClient(
    base_url=settings.strapi_api_url,
    headers={"Authorization": f"Bearer {settings.strapi_auth_token}"},
)


async def get_model_settings():
    response = await client.get("/llm-setting")
    response.raise_for_status()
    return response.json()