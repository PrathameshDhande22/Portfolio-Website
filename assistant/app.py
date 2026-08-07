from fastapi import FastAPI, status

app = FastAPI(debug=True)


@app.get("/health", status_code=status.HTTP_200_OK, response_model=dict[str, str])
def health_check():
    return {"status": "healthy"}
