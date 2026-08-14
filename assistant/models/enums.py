from enum import Enum


class SyncStatus(Enum):
    STARTED = "started"
    PROCESSING = "processing"
    COMPLETED = "completed"
