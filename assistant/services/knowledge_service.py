import logging
from typing import Dict, List, Set
from uuid import NAMESPACE_URL, UUID, uuid5

from langchain_postgres import PGVectorStore
from sqlalchemy.orm import load_only
from sqlmodel import delete, select
from sqlmodel.ext.asyncio.session import AsyncSession

from db import Knowledge, utcnow
from models import KnowledgeChunk, SourceDocument, SourceKey

logger = logging.getLogger(__name__)


def build_chunk_id(source_type: str, source_id: str, chunk_index: int) -> UUID:
    return uuid5(NAMESPACE_URL, f"knowledge:{source_type}:{source_id}:{chunk_index}")


async def get_existing_chunks(
    session: AsyncSession, source_type: str, source_id: str
) -> Dict[int, Knowledge]:
    statement = (
        select(Knowledge)
        .options(
            load_only(
                Knowledge.chunk_index,
                Knowledge.content_hash,
                Knowledge.embedding_model,
                Knowledge.created_at,
            )
        )
        .where(
            Knowledge.source_type == source_type,
            Knowledge.source_id == source_id,
        )
    )

    chunks = (await session.exec(statement)).all()
    logger.info(
        "Found stored chunks=%d for source_type=%s source_id=%s",
        len(chunks),
        source_type,
        source_id,
    )
    return {chunk.chunk_index: chunk for chunk in chunks}


async def get_stored_sources(session: AsyncSession) -> Set[SourceKey]:
    statement = select(Knowledge.source_type, Knowledge.source_id).distinct()
    rows = (await session.exec(statement)).all()
    return {SourceKey(source_type, source_id) for source_type, source_id in rows}


async def upsert_chunks(
    store: PGVectorStore,
    document: SourceDocument,
    chunks: List[KnowledgeChunk],
    existing: Dict[int, Knowledge],
    embedding_model: str,
) -> int:
    if not chunks:
        return 0

    now = utcnow()
    ids: List[UUID] = []
    texts: List[str] = []
    metadatas: List[dict] = []

    for chunk in chunks:
        stored = existing.get(chunk.chunk_index)
        ids.append(
            stored.id
            if stored
            else build_chunk_id(
                document.source_type, document.source_id, chunk.chunk_index
            )
        )
        texts.append(chunk.content)
        metadatas.append(
            {
                "source_type": document.source_type,
                "source_id": document.source_id,
                "chunk_index": chunk.chunk_index,
                "content_hash": chunk.content_hash,
                "embedding_model": embedding_model,
                "created_at": stored.created_at if stored else now,
                "updated_at": now if stored else None,
            }
        )

    logger.info(
        "Embedding chunks=%d with model=%s for title=%r source_id=%s",
        len(chunks),
        embedding_model,
        document.title,
        document.source_id,
    )
    await store.aadd_texts(texts=texts, metadatas=metadatas, ids=ids)
    logger.info(
        "Stored chunks=%d for title=%r source_id=%s",
        len(chunks),
        document.title,
        document.source_id,
    )
    return len(chunks)


async def delete_chunks_from(
    session: AsyncSession, source_type: str, source_id: str, from_index: int
) -> int:
    statement = delete(Knowledge).where(
        Knowledge.source_type == source_type,
        Knowledge.source_id == source_id,
        Knowledge.chunk_index >= from_index,
    )
    result = await session.exec(statement)
    await session.commit()

    deleted = result.rowcount or 0
    if deleted:
        logger.info(
            "Deleted trailing chunks=%d from chunk_index=%d for source_id=%s",
            deleted,
            from_index,
            source_id,
        )
    return deleted


async def delete_source(session: AsyncSession, source_type: str, source_id: str) -> int:
    statement = delete(Knowledge).where(
        Knowledge.source_type == source_type,
        Knowledge.source_id == source_id,
    )
    result = await session.exec(statement)
    await session.commit()

    deleted = result.rowcount or 0
    logger.info(
        "Deleted chunks=%d of removed source_type=%s source_id=%s",
        deleted,
        source_type,
        source_id,
    )
    return deleted
