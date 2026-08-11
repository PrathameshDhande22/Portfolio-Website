from fastapi import APIRouter, HTTPException
from cms.client import get_model_settings


router = APIRouter(tags=["Test"], prefix="/test")


@router.get("/llm-settings")
async def get_llm_settings():
    try:
        return await get_model_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
