from fastapi import APIRouter, HTTPException
from models import LLMSettings, StrapiResponse
from cms.client import strapi_client


router = APIRouter(tags=["Test"], prefix="/test")


@router.get("/llm-settings", response_model=StrapiResponse[LLMSettings])
async def get_llm_settings():
    try:
        return await strapi_client.get_model_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
