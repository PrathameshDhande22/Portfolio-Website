import logging
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import Response, SyncState
from core import require_signature
from services import add_new_sync, get_latest_sync, sync_knowledge_data

sync_router = APIRouter(tags=["Sync"])
logger = logging.getLogger(__name__)


@sync_router.post(
    "/sync",
    response_model=Response[SyncState],
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_signature)],
    responses={
        status.HTTP_202_ACCEPTED: {
            "model": Response[SyncState],
            "description": "Sync queued",
        },
        status.HTTP_409_CONFLICT: {"model": Response, "description": "Already syncing"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": Response,
            "description": "Error Occured",
        },
    },
)
async def sync_knowledge(
    backgroundtasks: BackgroundTasks,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response[SyncState]:
    sync_progress = await add_new_sync(session)
    if sync_progress is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already in Sync",
        )

    logger.info("Queueing the knowledge sync sync_id=%d", sync_progress.id)
    backgroundtasks.add_task(sync_knowledge_data, sync_id=sync_progress.id)

    return Response(
        status="success",
        message="Sync queued",
        data=SyncState.model_validate(sync_progress),
    )


@sync_router.get(
    "/sync/status",
    response_model=Response[SyncState],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_signature)],
)
async def sync_status(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response[SyncState]:
    latest = await get_latest_sync(session)
    if latest is None:
        return Response(status="success", message="No sync has run yet", data=None)

    return Response(
        status="success",
        message="Latest sync state",
        data=SyncState.model_validate(latest),
    )
