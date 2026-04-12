from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import EventStatus, HealthEvent
from app.schemas.timeline import HealthEventResponse, MarkCompleteRequest, TimelineResponse
from app.services.health_schedule.engine import (
    generate_and_save_schedule,
    get_next_due_event,
    refresh_event_statuses,
)

router = APIRouter(prefix="/timeline", tags=["Timeline"])


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
    dep = await session.get(Dependent, dependent_id)
    if not dep:
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

    return TimelineResponse(
        dependent_id=dependent_id,
        dependent_name=dep.name,
        generated_at=datetime.utcnow(),
        events=[HealthEventResponse.model_validate(e) for e in events],
        next_due=HealthEventResponse.model_validate(next_due) if next_due else None,
    )


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
