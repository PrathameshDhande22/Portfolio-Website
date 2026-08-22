import logging
from typing import Literal
from langchain_mistralai import MistralAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import AzureOpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain.embeddings import Embeddings
from config import settings
from core import LLMProviderException
from strapi import strapi_client

logger = logging.getLogger(__name__)


def get_embedding_provider(
    provider_name: Literal["OpenAI", "AzureOpenAI", "Mistral", "Gemini"],
    model_name: str,
) -> Embeddings:
    logger.info(
        "Selected Model Provider as %r with Model name %r",
        provider_name,
        model_name,
    )
    match provider_name:
        case "Mistral":
            return MistralAIEmbeddings(
                api_key=settings.mistral_api_key, model=model_name
            )
        case "AzureOpenAI":
            return AzureOpenAIEmbeddings(
                model=model_name,
                azure_deployment=model_name,
                api_key=settings.azure_openai_api_key,
                dimensions=1536,
                api_version="2025-01-preview",
            )
        case "Gemini":
            return GoogleGenerativeAIEmbeddings(
                model=model_name,
                api_key=settings.gemini_api_key,
                output_dimensionality=1536,
            )
        case "OpenAI":
            return OpenAIEmbeddings(api_key=settings.openai_api_key, model=model_name)
        case _:
            raise LLMProviderException(
                f"Unsupported LLM Provider: {provider_name}. Supported providers are: OpenAI, AzureOpenAI, MistralAI, GoogleGemini."
            )


async def get_provider() -> Embeddings:
    try:
        logger.info("Getting the embedding configuration from the strapi client")
        model_settings = await strapi_client.get_model_settings()
        return get_embedding_provider(
            model_settings.data.Embedding.Connector,
            model_settings.data.Embedding.Model_Name,
        )
    except Exception:
        logger.error(
            "Error occured while getting the embedding provider", exc_info=True
        )
        raise
