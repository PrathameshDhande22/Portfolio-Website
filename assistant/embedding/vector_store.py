import logging
from langchain_postgres import PGEngine, PGVectorStore
from langchain_postgres.v2.indexes import HNSWIndex
from langchain_core.vectorstores import VectorStore
from .provider import get_provider
from db import engine

logger = logging.getLogger(__name__)
engine = PGEngine.from_engine(engine)


async def get_vector_store() -> VectorStore:
    provider = await get_provider()
    logger.info("Getting the vector store")
    store = await PGVectorStore.create(
        engine=engine,
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
        index = HNSWIndex()
        await store.aapply_vector_index(index)
    except Exception as e:
        logger.error("Already exists HNSWIndex")
        pass

    return store
