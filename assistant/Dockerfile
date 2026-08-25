FROM python:3.12.14-slim AS dependencies

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UV_PROJECT_ENVIRONMENT=/usr/local 

COPY --from=ghcr.io/astral-sh/uv:0.12.5 /uv /uvx /bin/
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev --no-install-project

FROM python:3.12.14-slim AS production

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PATH="/usr/local/bin:${PATH}"

RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app --create-home --home-dir /app --shell /usr/sbin/nologin app

COPY --from=dependencies /usr/local /usr/local
COPY --chown=app:app . .

USER app

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0","--port","8000","--workers","4"]