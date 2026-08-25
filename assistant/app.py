import asyncio
from fastapi import FastAPI, HTTPException, Request, status
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
import uvicorn
from embedding import get_vector_store
from models import Response
from routes import sync_router, chat_router
from strapi.client import strapi_client
from core import purge_nonces, setup_logging
from db import close_db, init_db
from config import settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    await get_vector_store()
    purge = asyncio.create_task(purge_nonces())
    yield
    purge.cancel()
    await strapi_client.close_client()
    await close_db()


setup_logging()
is_development = settings.environment == "development"

app = FastAPI(
    debug=is_development,
    lifespan=lifespan,
    title="Portfolio Assistant",
    docs_url="/docs" if is_development else None,
    redoc_url="/redoc" if is_development else None,
    openapi_url="/openapi.json" if is_development else None,
)


@app.exception_handler(HTTPException)
async def ExceptionHandler(request: Request, exception: HTTPException):
    response = Response(status="error", message=exception.detail)
    return JSONResponse(
        content=response.model_dump(),
        status_code=exception.status_code,
    )


@app.get("/health", status_code=status.HTTP_200_OK, response_model=dict[str, str])
def health_check():
    return {"status": "healthy"}


app.include_router(router=sync_router)
app.include_router(router=chat_router)


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
