import logging
from typing import Annotated
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from services import add_new_sync
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_session
from models import Response
from services.sync_service import sync_knowledge_data

sync_router = APIRouter(tags=["Sync"])
logger = logging.getLogger(__name__)


@sync_router.post(
    "/sync",
    response_model=Response,
    status_code=status.HTTP_202_ACCEPTED,
    responses={
        status.HTTP_202_ACCEPTED: {"model": Response, "description": "Already in sync"},
        status.HTTP_409_CONFLICT: {"model": Response, "description": "Already synced"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": Response,
            "description": "Error Occured",
        },
    },
)
async def sync_knowledge(
    backgroundtasks: BackgroundTasks,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response:
    sync_progress = await add_new_sync(session)
    if sync_progress is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already in Sync",
        )
    backgroundtasks.add_task(sync_knowledge_data, session=session)

    return Response(status="success", message="Sync queued")
