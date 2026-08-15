from typing import List, Literal, Optional
from fastapi import APIRouter, HTTPException, Query
from embedding.provider import get_embedding_provider
from models import (
    LLMSettings,
    StrapiResponse,
    Project,
    Education,
    Certification,
    TimeLine,
    Experience,
    Page,
    SiteSettings,
)
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
    
@router.get("/embedding")
async def generate_embeddings():
    try:
        provider = get_embedding_provider("Mistral","mistral-embed")
        embeddings_generate:list[float] = await provider.aembed_query("These is Prathamesh")
        return embeddings_generate
    except Exception as e:
        raise HTTPException(500,str(e))


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


@router.get("/skills")
async def get_skills(
    by: Literal["Category", "Skills"] = Query(
        default="Skills",
        description="Group results by 'Category' (returns SkillCategory list with nested skills) "
        "or return a flat 'Skills' list.",
    ),
    name: Optional[str] = Query(
        default=None,
        description="Case-insensitive substring filter on Skill.Name (by=Skills) "
        "or SkillCategory.Name (by=Category).",
    ),
):
    """Test endpoint – fetch skills with optional grouping and name filter."""
    try:
        return await strapi_client.get_skills(by=by, name=name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects", response_model=StrapiResponse[List[Project]])
async def get_projects(
    tag: Optional[str] = Query(
        default=None,
        description="Case-insensitive substring filter on a tag name.",
    ),
    name: Optional[str] = Query(
        default=None,
        description="Case-insensitive substring filter on project title.",
    ),
):
    """Test endpoint – fetch projects with optional tag and name filters."""
    try:
        return await strapi_client.get_projects(tag=tag, name=name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/education", response_model=StrapiResponse[List[Education]])
async def get_education():
    """Test endpoint - fetch all education entries."""
    try:
        return await strapi_client.get_education()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/certifications", response_model=StrapiResponse[List[Certification]])
async def get_certifications(
    name: Optional[str] = Query(
        default=None,
        description="Case-insensitive substring filter on Title or Certifier.",
    ),
):
    """Test endpoint – fetch all certifications (including verify links) with optional name filter."""
    try:
        return await strapi_client.get_certifications(name=name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline", response_model=StrapiResponse[List[TimeLine]])
async def get_timeline():
    """Test endpoint - fetch all timeline entries."""
    try:
        return await strapi_client.get_timeline()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/experiences", response_model=StrapiResponse[List[Experience]])
async def get_experiences(
    name: Optional[str] = Query(
        default=None,
        description="Case-insensitive substring filter on Experience.Title or Experience.SubTitle.",
    ),
):
    """Test endpoint – fetch all work experience entries with optional name filter."""
    try:
        return await strapi_client.get_experiences(name=name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/page", response_model=StrapiResponse[List[Page]])
async def get_page(
    slug: str = Query(
        default="home",
        description="The page Slug to fetch (e.g. 'home'). Pages is a collection type in CMS.",
    ),
):
    """Test endpoint – fetch a page by its Slug (currently supports any Slug; defaults to 'home')."""
    try:
        return await strapi_client.get_page(slug=slug)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/site-settings", response_model=StrapiResponse[SiteSettings])
async def get_site_settings():
    """Test endpoint – fetch global site settings including social links."""
    try:
        return await strapi_client.get_site_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
