from datetime import datetime
import structlog

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import EventStatus, HealthEvent, VerificationStatus
from app.schemas.timeline import (
    HealthEventResponse,
    MarkCompleteRequest,
    MarkGivenRequest,
    TimelineResponse,
    VerifyVaccinationRequest,
)
from app.services.health_schedule.engine import (
    generate_and_save_schedule,
    get_next_due_event,
    refresh_event_statuses,
)

router = APIRouter(prefix="/timeline", tags=["Timeline"])
log = structlog.get_logger()


@router.get("/{dependent_id}", response_model=TimelineResponse)
async def get_timeline(
    dependent_id: str,
    category: str | None = None,
    session: AsyncSession = Depends(get_session),
) -> TimelineResponse:
    """
    Get the full health timeline for a dependent.
    - Generates schedule if it doesn't exist yet
    - Refreshes event statuses (upcoming/due/overdue) on every call
    - Optional category filter: vaccination, prenatal_checkup, medicine_dose, growth_check, etc.
    """
    try:
        log.info("timeline_request", dependent_id=dependent_id, category=category)

        dep = await session.get(Dependent, dependent_id)
        if not dep:
            log.warning("dependent_not_found", dependent_id=dependent_id)
            raise HTTPException(status_code=404, detail="Dependent not found")

        # Ensure schedule exists, generate if not
        events = await generate_and_save_schedule(dep, session)
        if not events:
            # Fetch existing if already generated
            events = await refresh_event_statuses(dependent_id, session)
        else:
            events = await refresh_event_statuses(dependent_id, session)

        # Apply category filter if provided
        if category:
            events = [e for e in events if e.category.value == category]

        next_due = get_next_due_event(events)

        log.info("timeline_success", dependent_id=dependent_id, event_count=len(events))

        return TimelineResponse(
            dependent_id=dependent_id,
            dependent_name=dep.name,
            generated_at=datetime.utcnow(),
            events=[HealthEventResponse.model_validate(e) for e in events],
            next_due=HealthEventResponse.model_validate(next_due) if next_due else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("timeline_error", dependent_id=dependent_id, error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch timeline: {str(e)}")


@router.patch("/{dependent_id}/events/{event_id}/complete", response_model=HealthEventResponse)
async def mark_event_complete(
    dependent_id: str,
    event_id: str,
    body: MarkCompleteRequest,
    session: AsyncSession = Depends(get_session),
) -> HealthEvent:
    """Mark a health event as completed."""
    event = await session.get(HealthEvent, event_id)
    if not event or event.dependent_id != dependent_id:
        raise HTTPException(status_code=404, detail="Health event not found")

    event.status = EventStatus.completed
    event.completed_at = datetime.utcnow()
    event.completed_by = body.completed_by
    event.location = body.location
    if body.notes:
        event.notes = body.notes
    event.updated_at = datetime.utcnow()
    session.add(event)
    await session.flush()
    await session.refresh(event)
    return event


@router.post("/{dependent_id}/events/{event_id}/mark-given", response_model=HealthEventResponse)
async def mark_vaccination_given(
    dependent_id: str,
    event_id: str,
    body: MarkGivenRequest,
    session: AsyncSession = Depends(get_session),
) -> HealthEvent:
    """Mark a vaccination as given by parent (pending ASHA verification)."""
    event = await session.get(HealthEvent, event_id)
    if not event or event.dependent_id != dependent_id:
        raise HTTPException(status_code=404, detail="Health event not found")

    event.marked_given_at = datetime.utcnow()
    event.verification_status = VerificationStatus.pending
    event.updated_at = datetime.utcnow()
    session.add(event)
    await session.flush()
    await session.refresh(event)
    return event


@router.post("/{dependent_id}/events/{event_id}/verify", response_model=HealthEventResponse)
async def verify_vaccination(
    dependent_id: str,
    event_id: str,
    body: VerifyVaccinationRequest,
    session: AsyncSession = Depends(get_session),
) -> HealthEvent:
    """Verify a vaccination by ASHA worker."""
    event = await session.get(HealthEvent, event_id)
    if not event or event.dependent_id != dependent_id:
        raise HTTPException(status_code=404, detail="Health event not found")

    event.verification_status = VerificationStatus.verified
    event.verified_by = body.verified_by
    event.verification_notes = body.verification_notes
    event.verification_document_url = body.verification_document_url
    event.updated_at = datetime.utcnow()
    session.add(event)
    await session.flush()
    await session.refresh(event)
    return event
