from typing import Any, Literal

from pydantic import BaseModel, Field


class SyncMutation(BaseModel):
    """A single queued mutation from the frontend's offline IndexedDB queue."""
    id: str                                            # Client-generated UUID
    endpoint: str                                      # e.g. "/api/v1/reminders/abc/done"
    method: Literal["POST", "PUT", "PATCH", "DELETE"]
    payload: dict[str, Any] = Field(default_factory=dict)
    timestamp: int                                     # Unix ms timestamp of when it was queued


class SyncBatchRequest(BaseModel):
    mutations: list[SyncMutation]


class SyncMutationResult(BaseModel):
    id: str
    status: Literal["applied", "failed", "skipped"]
    error: str | None = None


class SyncBatchResponse(BaseModel):
    total: int
    applied: int
    failed: int
    skipped: int
    results: list[SyncMutationResult]
