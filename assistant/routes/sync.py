from fastapi import APIRouter

sync_router = APIRouter(tags=["Sync"])


@sync_router.post("/sync")
async def sync_knowledge():
    return {"sync": "Queued"}
