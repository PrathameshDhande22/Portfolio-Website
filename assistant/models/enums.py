from enum import Enum


class SyncStatus(str, Enum):
    STARTED = "started"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ChatStage(str, Enum):
    PLANNER = "planner"
    ANSWER = "answer"
