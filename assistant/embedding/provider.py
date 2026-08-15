from typing import Literal
from langchain_mistralai import MistralAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import AzureOpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain.embeddings import Embeddings
from config import settings
from core import LLMProviderException


def get_embedding_provider(
    provider_name: Literal["OpenAI", "AzureOpenAI", "Mistral", "Gemini"],
    model_name: str,
) -> Embeddings:
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
                dimensions=1024,
                api_version="2025-01-preview",
            )
        case "Gemini":
            return GoogleGenerativeAIEmbeddings(
                model=model_name, api_key=settings.gemini_api_key
            )
        case "OpenAI":
            return OpenAIEmbeddings(api_key=settings.openai_api_key, model=model_name)
        case _:
            raise LLMProviderException(
                f"Unsupported LLM Provider: {provider_name}. Supported providers are: OpenAI, AzureOpenAI, MistralAI, GoogleGemini."
            )
