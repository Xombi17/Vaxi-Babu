"""
Health Schedule Engine
----------------------
Orchestrates schedule generation and status computation for dependents.
Reads from DB for existing events, generates new ones if needed, and
recomputes status (upcoming/due/overdue) dynamically against today's date.
"""

from datetime import date, datetime

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.dependent import Dependent, DependentType
from app.models.health_event import EventCategory, EventStatus, HealthEvent
from app.services.health_schedule.rules import generate_child_schedule, get_schedule_version

# ─────────────────────────────────────────────────────────────────────────────
# Status computation
# ─────────────────────────────────────────────────────────────────────────────

DUE_WINDOW_DAYS = 7  # "Due" = within 7 days of due_date


def compute_status(due_date: date, completed: bool, today: date | None = None) -> EventStatus:
    """Compute the current status of a health event from its due date."""
    if completed:
        return EventStatus.completed
    today = today or date.today()
    delta = (due_date - today).days
    if delta < 0:
        return EventStatus.overdue
    elif delta <= DUE_WINDOW_DAYS:
        return EventStatus.due
    else:
        return EventStatus.upcoming


# ─────────────────────────────────────────────────────────────────────────────
# Engine: generate and persist schedule for a dependent
# ─────────────────────────────────────────────────────────────────────────────

async def generate_and_save_schedule(
    dependent: Dependent,
    session: AsyncSession,
) -> list[HealthEvent]:
    """
    Generate the full health schedule for a dependent and save to DB.
    Idempotent: skips events that already exist (matched by schedule_key + dependent_id).
    Returns the full list of health events sorted by due_date.
    """
    if dependent.type != DependentType.child:
        # Only child NIS schedule supported in MVP
        return []

    dob = dependent.date_of_birth
    scheduled = generate_child_schedule(dob)

    # Fetch existing events for this dependent (to avoid duplicates)
    result = await session.exec(
        select(HealthEvent).where(HealthEvent.dependent_id == dependent.id)
    )
    existing_events = result.all()
    existing_keys = {e.schedule_key for e in existing_events}

    today = date.today()
    new_events: list[HealthEvent] = []

    for s in scheduled:
        if s.key in existing_keys:
            continue  # already persisted, skip

        status = compute_status(s.due_date, completed=False, today=today)

        event = HealthEvent(
            dependent_id=dependent.id,
            household_id=dependent.household_id,
            name=s.name,
            schedule_key=s.key,
            category=EventCategory(s.category),
            dose_number=s.dose_number,
            due_date=s.due_date,
            window_start=s.window_start,
            window_end=s.window_end,
            status=status,
            schedule_version=get_schedule_version(),
        )
        session.add(event)
        new_events.append(event)

    await session.flush()  # assign IDs without full commit

    # Return all events (existing + newly created)
    all_events = list(existing_events) + new_events
    all_events.sort(key=lambda e: e.due_date)
    return all_events


async def refresh_event_statuses(
    dependent_id: str,
    session: AsyncSession,
) -> list[HealthEvent]:
    """
    Recompute status for all non-completed health events and persist updates.
    Call this on every timeline fetch to keep statuses current.
    """
    result = await session.exec(
        select(HealthEvent).where(HealthEvent.dependent_id == dependent_id)
    )
    events = result.all()
    today = date.today()

    for event in events:
        if event.status == EventStatus.completed:
            continue
        new_status = compute_status(event.due_date, completed=False, today=today)
        if new_status != event.status:
            event.status = new_status
            event.updated_at = datetime.utcnow()

    await session.flush()
    events.sort(key=lambda e: e.due_date)
    return events


def get_next_due_event(events: list[HealthEvent]) -> HealthEvent | None:
    """Return the most urgent health event from a sorted list."""
    # First try overdue (oldest first), then due, then upcoming
    for priority in (EventStatus.overdue, EventStatus.due, EventStatus.upcoming):
        for event in events:
            if event.status == priority:
                return event
    return None
