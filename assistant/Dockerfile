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

ARG BUILD_DATE
ARG GIT_SHA
ARG VERSION

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.authors="prathamesh Dhande" \
      org.opencontainers.image.source="https://github.com/PrathameshDhande22/Portfolio-Website" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.url="https://github.com/PrathameshDhande22/Portfolio-Website" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.vendor="PrathameshDhande22" \
      org.opencontainers.image.title="Portfolio Assistant" \
      org.opencontainers.image.description="Porfolio AI Assistant using the LLM for responses" \
      com.prathameshdhande.title="Portfolio Assistant" \
      com.prathameshdhande.description="Porfolio AI Assistant using the LLM for responses" \
      com.prathameshdhande.project="Porfolio" \
      com.prathameshdhande.repository="https://github.com/PrathameshDhande22/Portfolio-Website" \
      com.prathameshdhande.service="Porfolio Assistant" \
      com.prathameshdhande.version="${VERSION}"

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app --create-home --home-dir /app --shell /usr/sbin/nologin app

COPY --from=dependencies /usr/local /usr/local
COPY --chown=app:app . .

USER app

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=30 CMD curl -fsS http://127.0.0.1:8000/health || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0","--port","8000","--workers","4"]