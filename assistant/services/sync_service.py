import datetime
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from models import SyncStatus
from db import Syncing
from sqlalchemy import and_, select

logger = logging.getLogger(__name__)


async def add_new_sync(session: AsyncSession) -> Syncing | None:
    try:
        exists = await check_existing_sync(session)
        if exists:
            logger.info("The Sync is already in progress so skipping")
            return None
        logger.info("New Sync Entry %s", datetime.datetime.now(datetime.timezone.utc))
        new_sync = Syncing()
        session.add(new_sync)
        await session.commit()
        logger.info("New Sync Entry Added %s", new_sync.startdate)
        return new_sync
    except Exception as e:
        logger.error("Error Occured when adding the new entry %s", str(e))
        raise e


async def check_existing_sync(session: AsyncSession) -> bool:
    try:
        logger.info("Checking the Sync if it is already working")
        stmt = select(Syncing).where(
            and_(Syncing.status == SyncStatus.STARTED, Syncing.enddate == None)
        )

        results = await session.scalar(stmt)
        return results is not None

    except Exception as e:
        logger.error("Error checking existing sync")
        raise e
