import asyncio
import logging
from typing import Optional

from langchain_postgres import PGEngine, PGVectorStore
from langchain_postgres.v2.indexes import HNSWIndex
from db import engine
from .provider import get_provider

logger = logging.getLogger(__name__)

pg_engine = PGEngine.from_engine(engine)

_vector_store: Optional[PGVectorStore] = None
_store_lock = asyncio.Lock()


async def get_vector_store() -> PGVectorStore:
    global _vector_store

    if _vector_store is not None:
        return _vector_store

    async with _store_lock:
        if _vector_store is None:
            _vector_store = await _create_vector_store()
    return _vector_store


async def _create_vector_store() -> PGVectorStore:
    provider = await get_provider()
    logger.info("Creating the vector store on assistant.knowledge")
    store = await PGVectorStore.create(
        engine=pg_engine,
        embedding_service=provider,
        table_name="knowledge",
        schema_name="assistant",
        content_column="content",
        embedding_column="embeddings",
        id_column="id",
        metadata_columns=[
            "source_type",
            "source_id",
            "chunk_index",
            "content_hash",
            "embedding_model",
            "created_at",
            "updated_at",
        ],
        k=6,
        fetch_k=6,
    )

    try:
        await store.aapply_vector_index(HNSWIndex())
        logger.info("Applied the HNSW vector index")
    except Exception:
        logger.warning("HNSW vector index already exists, keeping the existing one")

    return store
