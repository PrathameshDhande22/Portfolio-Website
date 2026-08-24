import asyncio
import datetime
import hashlib
import hmac
import logging

from fastapi import HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, delete, func, select

from config import settings
from db import RequestNonce, session_scope, utcnow
from strapi import strapi_client

logger = logging.getLogger(__name__)


def build_signature(
    method: str, path: str, timestamp: str, nonce: str, body: bytes
) -> str:
    canonical = "\n".join(
        [method.upper(), path, timestamp, nonce, hashlib.sha256(body).hexdigest()]
    )
    digest = hmac.new(
        settings.client_secret.encode("utf-8"), canonical.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return f"sha256={digest}"


async def require_signature(request: Request) -> None:
    timestamp = request.headers.get("X-Timestamp", "")
    nonce = request.headers.get("X-Nonce", "")
    signature = request.headers.get("X-Signature", "")
    path = request.url.path

    if not (timestamp and nonce and signature):
        logger.warning("Unsigned request path=%s", path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing signature headers"
        )

    if not timestamp.isdigit():
        logger.warning("Unreadable timestamp=%r path=%s", timestamp, path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid timestamp"
        )

    age = abs(int(utcnow().timestamp()) - int(timestamp))
    if age > 120:
        logger.warning("Stale request path=%s age=%ds", path, age)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Signature expired"
        )

    expected = build_signature(
        request.method, path, timestamp, nonce, await request.body()
    )
    if not hmac.compare_digest(expected, signature):
        logger.warning("Bad signature path=%s", path)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature"
        )

    async with session_scope() as session:
        session.add(RequestNonce(nonce=nonce, endpoint=path))
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            logger.warning("Replayed nonce=%s path=%s", nonce, path)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Request already processed"
            )

    logger.info("Accepted signed request path=%s nonce=%s", path, nonce)


async def is_daily_cap_reached() -> bool:
    allowed = (await strapi_client.get_model_settings()).data.MaxDailyResponses
    midnight = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    statement = (
        select(func.count())
        .select_from(RequestNonce)
        .where(
            RequestNonce.endpoint == "/chat",
            col(RequestNonce.created_at) >= midnight,
        )
    )
    async with session_scope() as session:
        used = (await session.exec(statement)).one()

    logger.info("Daily chat usage used=%d allowed=%d", used, allowed)
    return used > allowed


async def purge_nonces() -> None:
    while True:
        await asyncio.sleep(12 * 3600)
        try:
            cutoff = utcnow() - datetime.timedelta(days=2)
            async with session_scope() as session:
                result = await session.exec(
                    delete(RequestNonce).where(col(RequestNonce.created_at) < cutoff)
                )
                await session.commit()
            logger.info("Purged nonces=%d older than %s", result.rowcount or 0, cutoff)
        except Exception as e:
            logger.error("Nonce purge failed error=%s", str(e), exc_info=True)
