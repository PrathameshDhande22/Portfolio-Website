from typing import Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from langchain_mistralai import ChatMistralAI
from langchain.chat_models import BaseChatModel
from core import LLMProviderException
from config import settings


def get_llm_provider(
    provider_name: Literal["OpenAI", "AzureOpenAI", "Mistral", "Gemini"],
    model_name: str,
    temperature: float = 0.5,
    max_tokens: int = 1024,
    base_url: str = None,
) -> BaseChatModel:
    match provider_name:
        case "OpenAI":
            return ChatOpenAI(
                model=model_name,
                temperature=temperature,
                api_key=settings.openai_api_key,
                max_tokens=max_tokens,
                max_retries=2,
            )
        case "AzureOpenAI":
            return AzureChatOpenAI(
                azure_deployment=model_name,
                azure_endpoint=base_url,
                api_key=settings.azure_openai_api_key,
                temperature=temperature,
                max_tokens=max_tokens,
                max_retries=2,
            )
        case "Mistral":
            return ChatMistralAI(
                api_key=settings.mistral_api_key,
                model=model_name,
                temperature=temperature,
                max_tokens=max_tokens,
                max_retries=2,
            )
        case "Gemini":
            return ChatGoogleGenerativeAI(
                model=model_name,
                temperature=temperature,
                api_key=settings.gemini_api_key,
                max_tokens=max_tokens,
                max_retries=2,
            )
        case _:
            raise LLMProviderException(
                f"Unsupported LLM Provider: {provider_name}. Supported providers are: OpenAI, AzureOpenAI, MistralAI, GoogleGemini."
            )
