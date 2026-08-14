import uuid
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from pgvector.sqlalchemy import VECTOR
from sqlalchemy import Column, DateTime, Index, Text
from sqlmodel import Field, SQLModel

from models.enums import SyncStatus

EMBEDDING_DIM = 1024


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Syncing(SQLModel, table=True):
    __tablename__ = "syncing"

    id: Optional[int] = Field(default=None, primary_key=True)
    startdate: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    enddate: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    status: SyncStatus = Field(default=SyncStatus.STARTED, index=True)
    error: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))

    __table_args__ = {"schema": "assistant"}


class Knowledge(SQLModel, table=True):
    __tablename__ = "knowledge"

    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    source_type: str = Field(nullable=False, max_length=50)
    source_id: str = Field(nullable=False, max_length=255)
    chunk_index: int = Field(nullable=False)
    content: str = Field(sa_column=Column(Text, nullable=False))
    content_hash: str = Field(nullable=False, max_length=64)
    embeddings: list[float] = Field(sa_type=VECTOR(EMBEDDING_DIM), nullable=False)
    embedding_model: str = Field(nullable=False, max_length=50)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True)
    )

    __table_args__ = (
        Index(
            "idx_knowledge_source_type_source_id_chunk_index",
            "source_type",
            "source_id",
            "chunk_index",
            unique=True,
        ),
        Index(
            "idx_knowledge_source_id_content_hash",
            "source_id",
            "content_hash",
        ),
        {"schema": "assistant"},
    )
