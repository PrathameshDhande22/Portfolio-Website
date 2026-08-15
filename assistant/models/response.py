from typing import Generic, Literal, Optional, TypeVar
from pydantic import BaseModel, Field


T = TypeVar("T")


class Response(BaseModel, Generic[T]):
    status: Literal["success", "error", "failed"] = Field(
        description="Status of the response", default="success"
    )
    message: Optional[str] = Field(description="Message of the response")
    data: Optional[T] | None = Field(description="Response data", default=None)
