import logging
from collections.abc import AsyncIterable

from fastapi import APIRouter, status
from fastapi.sse import EventSourceResponse, ServerSentEvent

from models import ChatRequest
from services import stream_chat

chat_router = APIRouter(tags=["Chat"])
logger = logging.getLogger(__name__)


@chat_router.post(
    "/chat",
    status_code=status.HTTP_200_OK,
    response_class=EventSourceResponse,
    responses={
        status.HTTP_200_OK: {
            "description": "Events in order: meta, plan, delta (many), usage, done, or error"
        }
    },
)
async def chat(request: ChatRequest) -> AsyncIterable[ServerSentEvent]:
    logger.info(
        "Chat request thread_id=%s messages=%d", request.thread_id, len(request.messages)
    )
    async for event in stream_chat(request):
        yield event
