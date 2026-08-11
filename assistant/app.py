from fastapi import FastAPI, status
from routes.test_route import router as test

app = FastAPI(debug=True)


@app.get("/health", status_code=status.HTTP_200_OK, response_model=dict[str, str])
def health_check():
    return {"status": "healthy"}

app.include_router(router=test)
