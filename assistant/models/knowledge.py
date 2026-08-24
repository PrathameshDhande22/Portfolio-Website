from datetime import datetime
from typing import List, Literal, NamedTuple, Optional
from pydantic import BaseModel, ConfigDict, Field

from .enums import SyncStatus

SourceType = Literal["Blog", "Resume", "Custom", "FAQ"]


class SourceKey(NamedTuple):
    source_type: str
    source_id: str


class KnowledgeChunk(BaseModel):
    chunk_index: int = Field(description="Ordering of the chunk inside its source document")
    content: str = Field(description="Chunk text, already carrying its heading context")
    content_hash: str = Field(description="SHA-256 of the content, used to skip re-embedding")


class SourceDocument(BaseModel):
    source_type: SourceType = Field(description="AIKnowledge SourceType the chunks belong to")
    source_id: str = Field(description="Strapi documentId, used for reconciliation")
    title: str = Field(description="Human readable title, prepended to every chunk")
    chunks: List[KnowledgeChunk] = Field(default_factory=list, description="Ordered chunks")


class SourceSyncResult(BaseModel):
    source_type: str
    source_id: str
    title: str
    embedded: int = Field(default=0, description="Chunks embedded or re-embedded")
    skipped: int = Field(default=0, description="Chunks whose hash and model were unchanged")
    deleted: int = Field(default=0, description="Chunks removed because the document shrank")


class SyncSummary(BaseModel):
    sources: int = 0
    embedded_chunks: int = 0
    skipped_chunks: int = 0
    deleted_chunks: int = 0
    deleted_sources: int = 0


class SyncState(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: SyncStatus
    startdate: datetime
    enddate: Optional[datetime] = None
    error: Optional[str] = None
