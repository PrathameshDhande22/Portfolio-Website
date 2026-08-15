from fastapi import APIRouter


chat_router = APIRouter(tags=["Chat"])


@chat_router.post("/chat")
async def stream_chat():
    return "chat"
