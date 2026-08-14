from fastapi import FastAPI, status
from contextlib import asynccontextmanager
from routes.test_route import router as test
from routes.sync_route import sync_router
from cms.client import strapi_client
from core import setup_logging
from db import close_db, init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield
    await strapi_client.close_client()
    await close_db()


setup_logging()
app = FastAPI(debug=True, lifespan=lifespan)


@app.get("/health", status_code=status.HTTP_200_OK, response_model=dict[str, str])
def health_check():
    return {"status": "healthy"}


app.include_router(router=test)
app.include_router(router=sync_router)
