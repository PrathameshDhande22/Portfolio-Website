from fastapi import APIRouter, HTTPException
from models import LLMSettings, StrapiResponse
from langchain.messages import AIMessage
from cms.client import strapi_client
from llm import get_llm_provider


router = APIRouter(tags=["Test"], prefix="/test")


@router.get("/llm-settings", response_model=StrapiResponse[LLMSettings])
async def get_llm_settings():
    try:
        return await strapi_client.get_model_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=AIMessage)
async def test_chat():
    try:
        provider = get_llm_provider(
            "Mistral", "mistral-medium-3-5", temperature=0.5, max_tokens=1024
        )
        response = provider.invoke("who are you")
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
