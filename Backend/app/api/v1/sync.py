"""
Offline Sync API
----------------
Accepts a batch of mutations from the frontend's offline IndexedDB queue.
When the user comes back online, the frontend sends all queued operations
in a single POST and this endpoint replays them.
"""


import httpx
import structlog
from fastapi import APIRouter, Request

from app.schemas.sync import SyncBatchRequest, SyncBatchResponse, SyncMutationResult

log = structlog.get_logger()
router = APIRouter(prefix="/sync", tags=["Offline Sync"])


@router.post("/batch", response_model=SyncBatchResponse)
async def sync_batch(
    body: SyncBatchRequest,
    request: Request,
) -> SyncBatchResponse:
    """
    Replay a batch of offline mutations from the client queue.
    Each mutation is forwarded internally to the appropriate endpoint.
    Results are returned per-mutation so the client can clean up only
    the ones that succeeded.
    """
    results: list[SyncMutationResult] = []
    applied = 0
    failed = 0
    skipped = 0

    base_url = str(request.base_url).rstrip("/")

    async with httpx.AsyncClient(base_url=base_url, timeout=30.0) as client:
        for mutation in body.mutations:
            try:
                # Skip mutations with empty or unsafe endpoints
                if not mutation.endpoint.startswith("/api/v1/"):
                    results.append(SyncMutationResult(
                        id=mutation.id,
                        status="skipped",
                        error="Endpoint not allowed in sync batch",
                    ))
                    skipped += 1
                    continue

                # Forward the original authentication token to internal calls
                auth_header = request.headers.get("Authorization")
                headers = {}
                if auth_header:
                    headers["Authorization"] = auth_header

                response = await client.request(
                    method=mutation.method,
                    url=mutation.endpoint,
                    json=mutation.payload if mutation.payload else None,
                    headers=headers,
                )

                if response.status_code < 400:
                    results.append(SyncMutationResult(id=mutation.id, status="applied"))
                    applied += 1
                elif response.status_code == 409:
                    # Conflict: mutation already applied (idempotent)
                    results.append(SyncMutationResult(id=mutation.id, status="skipped"))
                    skipped += 1
                else:
                    results.append(SyncMutationResult(
                        id=mutation.id,
                        status="failed",
                        error=f"HTTP {response.status_code}",
                    ))
                    failed += 1

            except Exception as exc:
                log.warning("sync_mutation_failed", mutation_id=mutation.id, error=str(exc))
                results.append(SyncMutationResult(
                    id=mutation.id,
                    status="failed",
                    error=str(exc),
                ))
                failed += 1

    return SyncBatchResponse(
        total=len(body.mutations),
        applied=applied,
        failed=failed,
        skipped=skipped,
        results=results,
    )
