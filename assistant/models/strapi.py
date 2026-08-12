from datetime import datetime
from typing import Generic, Literal, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class StrapiResponse(BaseModel, Generic[T]):
    data: T
    meta: dict


class StrapiData(BaseModel):
    id: int
    documentId: str
    createdAt: datetime
    updatedAt: datetime
    publishedAt: datetime


class ModelConfiguration(BaseModel):
    id: int
    Connector: Literal["OpenAI", "AzureOpenAI", "Mistral", "Gemini"]
    SystemPrompt: str
    BaseURL: Optional[str]
    Temperature: float
    MaxTokens: Optional[int]
    Model_Name: str


class LLMSettings(StrapiData):
    MaxDailyResponses: int
    Planner: ModelConfiguration
    Response: ModelConfiguration
    Embedding: ModelConfiguration
