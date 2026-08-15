from fastapi import FastAPI, HTTPException, Request, status
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
import uvicorn
from models.response import Response
from routes import sync_router, router as test
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


app.include_router(router=test)
app.include_router(router=sync_router)


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
