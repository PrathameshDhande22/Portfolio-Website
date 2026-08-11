from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from cms.client import client
from routes.test_route import router as test


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with client:
        yield


app = FastAPI(debug=True, lifespan=lifespan)


@app.get("/health", status_code=status.HTTP_200_OK, response_model=dict[str, str])
def health_check():
    return {"status": "healthy"}

app.include_router(router=test)
