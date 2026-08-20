from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from .enums import ChatStage

ChatRole = Literal["human", "assistant"]

RetrievalSource = Literal[
    "skills",
    "projects",
    "experience",
    "education",
    "certifications",
    "timeline",
    "blogs",
    "site",
]

PlannerAction = Literal["respond", "retrieve"]


class ChatMessage(BaseModel):
    role: ChatRole = Field(description="Who wrote the message, only human or assistant")
    content: str = Field(min_length=1, description="Message text")


class ChatRequest(BaseModel):
    thread_id: Optional[UUID] = Field(
        default=None, description="Conversation id, generated when the client has none"
    )
    messages: List[ChatMessage] = Field(
        min_length=1, description="Full conversation, oldest first, ending with a human turn"
    )


class RetrievalFilter(BaseModel):
    name: Optional[str] = Field(
        default=None, description="Match on the title or name of the entry"
    )
    category: Optional[str] = Field(
        default=None, description="Match on the category or group the entry belongs to"
    )
    tag: Optional[str] = Field(
        default=None, description="Match on a technology or tag attached to the entry"
    )


class StructuredQuery(BaseModel):
    source: RetrievalSource = Field(description="Which portfolio collection to read")
    filters: RetrievalFilter = Field(
        default_factory=RetrievalFilter, description="Narrows the rows, all fields optional"
    )


class SemanticQuery(BaseModel):
    enabled: bool = Field(
        default=False, description="Whether to search the embedded resume and articles"
    )
    query: str = Field(default="", description="Search phrase to embed, empty when disabled")


class PlannerDecision(BaseModel):
    action: PlannerAction = Field(
        description="respond to answer directly from message, retrieve to gather context first"
    )
    question: str = Field(
        description="The latest question rewritten to stand on its own without the history"
    )
    structured: List[StructuredQuery] = Field(
        default_factory=list, description="Collections to read, empty when none apply"
    )
    semantic: SemanticQuery = Field(
        default_factory=SemanticQuery, description="Semantic search over the indexed knowledge"
    )
    message: str = Field(
        default="", description="Reply used verbatim when action is respond, otherwise empty"
    )


class RetrievedContext(BaseModel):
    markdown: str = Field(description="Everything gathered, rendered as markdown for the model")
    sources: List[str] = Field(default_factory=list, description="Collections that returned rows")
    chunk_ids: List[str] = Field(default_factory=list, description="Vector chunk ids retrieved")


class TokenUsage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0


class MetaEvent(BaseModel):
    thread_id: UUID = Field(description="Conversation id to send back on the next turn")


class PlanEvent(BaseModel):
    action: PlannerAction
    question: str = Field(description="The standalone question the answer is written against")
    sources: List[RetrievalSource] = Field(default_factory=list)
    semantic: bool = Field(description="Whether the indexed knowledge was searched")


class DeltaEvent(BaseModel):
    content: str = Field(description="Next piece of the answer")


class UsageEvent(BaseModel):
    stage: ChatStage
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0


class DoneEvent(BaseModel):
    thread_id: UUID
    action: PlannerAction


class ErrorEvent(BaseModel):
    message: str
