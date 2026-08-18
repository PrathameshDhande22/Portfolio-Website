import asyncio
import datetime
import logging
from typing import List, Optional, Set
from langchain_postgres import PGVectorStore
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import desc, or_
from db import Syncing, session_scope, utcnow
from embedding import get_vector_store, process
from models import (
    AIKnowledge,
    SourceDocument,
    SourceKey,
    SourceSyncResult,
    SyncStatus,
    SyncSummary,
)
from strapi import strapi_client

from .knowledge_service import (
    delete_chunks_from,
    delete_source,
    get_existing_chunks,
    get_stored_sources,
    upsert_chunks,
)

logger = logging.getLogger(__name__)

MAX_CONCURRENT_SOURCES = 4

SYNC_STALE_AFTER = datetime.timedelta(minutes=30)

RUNNING_STATUSES = (SyncStatus.STARTED, SyncStatus.PROCESSING)


async def add_new_sync(session: AsyncSession) -> Optional[Syncing]:
    try:
        logger.info("Checking the Sync if it is already working")
        statement = select(Syncing).where(
            and_(
                or_(*(Syncing.status == status for status in RUNNING_STATUSES)),
                Syncing.enddate == None,
                Syncing.startdate >= utcnow() - SYNC_STALE_AFTER,
            )
        )
        if await session.scalar(statement) is not None:
            logger.info("The Sync is already in progress so skipping")
            return None

        logger.info("New Sync Entry %s", utcnow())
        new_sync = Syncing()
        session.add(new_sync)
        await session.commit()

        logger.info("New Sync Entry Added id=%s at=%s", new_sync.id, new_sync.startdate)
        return new_sync
    except Exception as e:
        logger.error("Error Occured when adding the new entry %s", str(e))
        raise e


async def get_latest_sync(session: AsyncSession) -> Optional[Syncing]:
    statement = select(Syncing).order_by(desc(Syncing.id)).limit(1)
    return await session.scalar(statement)


async def sync_knowledge_data(sync_id: int) -> None:
    logger.info("Started syncing the knowledge sync_id=%d", sync_id)
    try:
        await _update_sync_status(sync_id, SyncStatus.PROCESSING)

        model_settings = await strapi_client.get_model_settings()
        embedding_model = model_settings.data.Embedding.Model_Name
        store = await get_vector_store()

        logger.info("Getting the AIKnowledge from Strapi")
        knowledge_response = await strapi_client.get_ai_knowledge()
        logger.info(
            "Fetched the AI Knowledge from Strapi Total=%d",
            len(knowledge_response.data),
        )

        semaphore = asyncio.Semaphore(MAX_CONCURRENT_SOURCES)
        results: List[SourceSyncResult] = []

        async def load(entry: AIKnowledge) -> List[SourceDocument]:
            async with semaphore:
                try:
                    return await process(entry)
                except Exception as e:
                    logger.error(
                        "Failed to load AIKnowledge title=%r document_id=%s",
                        entry.Title,
                        entry.documentId,
                        exc_info=True,
                    )
                    results.append(
                        SourceSyncResult(
                            source_type=entry.SourceType,
                            source_id=entry.documentId,
                            title=entry.Title,
                            error=str(e),
                        )
                    )
                    return []

        loaded = await asyncio.gather(
            *(load(entry) for entry in knowledge_response.data)
        )

        documents: List[SourceDocument] = []
        sources: Set[SourceKey] = set()
        for document in (document for group in loaded for document in group):
            key = SourceKey(document.source_type, document.source_id)
            if key in sources:
                logger.warning(
                    "Duplicate source_type=%s source_id=%s title=%r, keeping the first one",
                    document.source_type,
                    document.source_id,
                    document.title,
                )
                continue
            sources.add(key)
            documents.append(document)

        logger.info(
            "Prepared source documents=%d chunks=%d failed=%d",
            len(documents),
            sum(len(document.chunks) for document in documents),
            len(results),
        )

        async def sync(document: SourceDocument) -> SourceSyncResult:
            async with semaphore:
                return await _sync_document(document, embedding_model, store)

        results.extend(await asyncio.gather(*(sync(doc) for doc in documents)))

        failed = [result.title for result in results if result.error]
        removed: Set[SourceKey] = set()
        reconciled_chunks = 0

        if failed:
            logger.warning("Skipping reconciliation, sources failed=%d", len(failed))
        elif not documents:
            logger.warning(
                "Skipping reconciliation, Strapi returned no source documents"
            )
        else:
            async with session_scope() as session:
                removed = await get_stored_sources(session) - sources
                logger.info("Reconciling removed sources=%d", len(removed))
                for source in removed:
                    reconciled_chunks += await delete_source(
                        session, source.source_type, source.source_id
                    )

        summary = SyncSummary(
            sources=len(documents),
            embedded_chunks=sum(result.embedded for result in results),
            skipped_chunks=sum(result.skipped for result in results),
            deleted_chunks=sum(result.deleted for result in results)
            + reconciled_chunks,
            deleted_sources=len(removed),
            failed_sources=failed,
        )

        if failed:
            await _update_sync_status(
                sync_id, SyncStatus.FAILED, error=f"Failed sources: {', '.join(failed)}"
            )
            logger.warning(
                "Sync finished with failures sync_id=%d summary=%s",
                sync_id,
                summary.model_dump(),
            )
            return

        await _update_sync_status(sync_id, SyncStatus.COMPLETED)
        logger.info(
            "Sync completed sync_id=%d summary=%s", sync_id, summary.model_dump()
        )
    except Exception as e:
        logger.error(
            "Error occured when syncing the knowledge error=%s", str(e), exc_info=True
        )
        await _update_sync_status(sync_id, SyncStatus.FAILED, error=str(e))


async def _sync_document(
    document: SourceDocument,
    embedding_model: str,
    store: PGVectorStore,
) -> SourceSyncResult:
    result = SourceSyncResult(
        source_type=document.source_type,
        source_id=document.source_id,
        title=document.title,
    )

    try:
        async with session_scope() as session:
            existing = await get_existing_chunks(
                session, document.source_type, document.source_id
            )

            pending = []
            for chunk in document.chunks:
                stored = existing.get(chunk.chunk_index)
                if stored is None:
                    logger.info(
                        "New chunk index=%d for title=%r",
                        chunk.chunk_index,
                        document.title,
                    )
                elif stored.content_hash != chunk.content_hash:
                    logger.info(
                        "Changed chunk index=%d for title=%r",
                        chunk.chunk_index,
                        document.title,
                    )
                elif stored.embedding_model != embedding_model:
                    logger.info(
                        "Chunk index=%d for title=%r was embedded with model=%s, re-embedding with model=%s",
                        chunk.chunk_index,
                        document.title,
                        stored.embedding_model,
                        embedding_model,
                    )
                else:
                    logger.debug(
                        "Unchanged chunk index=%d for title=%r, skipping the embedding",
                        chunk.chunk_index,
                        document.title,
                    )
                    continue

                pending.append(chunk)

            result.skipped = len(document.chunks) - len(pending)
            result.embedded = await upsert_chunks(
                store, document, pending, existing, embedding_model
            )
            result.deleted = await delete_chunks_from(
                session,
                document.source_type,
                document.source_id,
                len(document.chunks),
            )

        logger.info(
            "Synced title=%r embedded=%d skipped=%d deleted=%d",
            document.title,
            result.embedded,
            result.skipped,
            result.deleted,
        )
    except Exception as e:
        logger.error(
            "Failed to sync title=%r source_id=%s",
            document.title,
            document.source_id,
            exc_info=True,
        )
        result.error = str(e)

    return result


async def _update_sync_status(
    sync_id: int, status: SyncStatus, error: Optional[str] = None
) -> None:
    async with session_scope() as session:
        sync = await session.get(Syncing, sync_id)
        if sync is None:
            logger.warning("Sync record id=%d not found, cannot update it", sync_id)
            return

        sync.status = status
        sync.error = error
        if status in (SyncStatus.COMPLETED, SyncStatus.FAILED):
            sync.enddate = utcnow()

        session.add(sync)
        await session.commit()
        logger.info("Sync id=%d moved to status=%s", sync_id, status.value)
