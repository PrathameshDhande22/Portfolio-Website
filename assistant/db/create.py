import logging
from collections.abc import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from config import settings
from .domainmodel import Knowledge, Syncing
from sqlalchemy.schema import CreateSchema

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.postgres_connection_string,
    echo=True,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.execute(CreateSchema("assistant", True))
        await conn.run_sync(SQLModel.metadata.create_all)
    logger.info("Database ready, tables=%s", sorted(SQLModel.metadata.tables))


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def close_db() -> None:
    await engine.dispose()
