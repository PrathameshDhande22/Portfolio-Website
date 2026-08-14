from datetime import datetime, timezone
from uuid import UUID
import uuid
from sqlalchemy import Column, Text
from sqlmodel import SQLModel, Field
from pgvector.sqlalchemy import VECTOR
from models.enums import SyncStatus


class Syncing(SQLModel, table=True):
    __tablename__ = "Syncing"
    id: int = Field(default=None, primary_key=True, index=True)
    startdate: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    enddate: datetime = Field(nullable=True)
    status: SyncStatus = Field(default=SyncStatus.STARTED, index=True)


class Knowledge(SQLModel, table=True):
    __tablename__ = "Knowledge"
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    source_type: str = Field(nullable=False, max_length=50)
    source_id: str = Field(nullable=False)
    chunk_index: int = Field(nullable=False)
    content: str = Field(sa_column=Column(Text, nullable=False))
    content_hash: str = Field(nullable=False)
    embeddings: list[float] = Field(sa_type=VECTOR(1024), nullable=False)
    embedding_model: str = Field(nullable=False, max_length=50)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(nullable=True)
