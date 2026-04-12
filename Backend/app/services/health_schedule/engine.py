"""
Health Schedule Engine
----------------------
Orchestrates schedule generation and status computation for dependents.
Reads from DB for existing events, generates new ones if needed, and
recomputes status (upcoming/due/overdue) dynamically against today's date.
"""

import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.dependent import Dependent, DependentType
from app.models.health_event import EventCategory, EventStatus, HealthEvent
from app.models.medicine_regimen import FrequencyType, MedicineRegimen
from app.services.health_schedule.rules import generate_child_schedule, get_schedule_version

# ─────────────────────────────────────────────────────────────────────────────
# Status computation
# ─────────────────────────────────────────────────────────────────────────────

DUE_WINDOW_DAYS = 7  # "Due" = within 7 days of due_date

# ─────────────────────────────────────────────────────────────────────────────
# Pregnancy schedule loading
# ─────────────────────────────────────────────────────────────────────────────

_pregnancy_data: dict[str, Any] | None = None
_growth_data: dict[str, Any] | None = None


def _load_pregnancy_schedule() -> dict[str, Any]:
    global _pregnancy_data
    if _pregnancy_data is None:
        path = Path(__file__).parent.parent.parent / "data" / "pregnancy_schedule.json"
        if path.exists():
            _pregnancy_data = json.loads(path.read_text())
        else:
            _pregnancy_data = {"events": []}
    return _pregnancy_data


def _load_growth_schedule() -> dict[str, Any]:
    global _growth_data
    if _growth_data is None:
        # For now, return a simple schedule structure
        # In production, this would load from growth_check_schedule.json
        _growth_data = {
            "version": "growth_v1",
            "intervals": [
                {"age_start_months": 0, "age_end_months": 6, "interval_days": 30},
                {"age_start_months": 6, "age_end_months": 12, "interval_days": 60},
                {"age_start_months": 12, "age_end_months": 36, "interval_days": 90},
                {"age_start_months": 36, "age_end_months": 60, "interval_days": 180},
                {"age_start_months": 60, "age_end_months": 216, "interval_days": 365},
            ],
        }
    return _growth_data


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
    result = await session.execute(select(HealthEvent).where(HealthEvent.dependent_id == dependent.id))
    existing_events = result.scalars().all()
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
    result = await session.execute(select(HealthEvent).where(HealthEvent.dependent_id == dependent_id))
    events = result.scalars().all()
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


async def generate_pregnancy_schedule(
    dependent: Dependent,
    lmp_date: date,  # Last Menstrual Period date
    session: AsyncSession,
) -> list[HealthEvent]:
    """Generate pregnancy care schedule from LMP date."""
    if dependent.type != DependentType.pregnant:
        return []

    pregnancy_data = _load_pregnancy_schedule()
    events_data = pregnancy_data.get("events", [])

    # Fetch existing events
    result = await session.execute(select(HealthEvent).where(HealthEvent.dependent_id == dependent.id))
    existing_events = result.scalars().all()
    existing_keys = {e.schedule_key for e in existing_events}

    today = date.today()
    new_events: list[HealthEvent] = []

    for e in events_data:
        if e["key"] in existing_keys:
            continue

        days_from_lmp = e["weeks_from_lmp"] * 7
        due_date = lmp_date + timedelta(days=days_from_lmp)
        window_start = lmp_date + timedelta(days=days_from_lmp + e["window_start_days"])
        window_end = lmp_date + timedelta(days=days_from_lmp + e["window_end_days"])

        status = compute_status(due_date, completed=False, today=today)

        # Map category to EventCategory enum
        category_str = e.get("category", "checkup")
        if category_str == "checkup":
            category = EventCategory.prenatal_checkup
        elif category_str == "vaccination":
            category = EventCategory.vaccination
        elif category_str == "supplement":
            category = EventCategory.supplement
        else:
            category = EventCategory.checkup

        event = HealthEvent(
            dependent_id=dependent.id,
            household_id=dependent.household_id,
            name=e["name"],
            schedule_key=e["key"],
            category=category,
            dose_number=e.get("dose", 1),
            due_date=due_date,
            window_start=window_start,
            window_end=window_end,
            status=status,
            schedule_version=pregnancy_data.get("version", "pregnancy_v1"),
        )
        session.add(event)
        new_events.append(event)

    await session.flush()
    all_events = list(existing_events) + new_events
    all_events.sort(key=lambda e: e.due_date)
    return all_events


async def generate_medicine_events(
    regimen: MedicineRegimen,
    session: AsyncSession,
    window_days: int = 30,
) -> list[HealthEvent]:
    """
    Generate medicine dose events for a regimen (rolling 30-day window).
    Skip generation for as_needed frequency.
    """
    if regimen.frequency == FrequencyType.as_needed:
        return []

    # Fetch existing medicine events for this regimen
    result = await session.execute(
        select(HealthEvent).where(
            HealthEvent.dependent_id == regimen.dependent_id,
            HealthEvent.category == EventCategory.medicine_dose,
            HealthEvent.schedule_key.like(f"med-{regimen.id}-%"),
        )
    )
    existing_events = result.scalars().all()
    existing_keys = {e.schedule_key for e in existing_events}

    today = date.today()
    end_window = today + timedelta(days=window_days)

    # Determine actual end date
    actual_end = regimen.end_date if regimen.end_date else end_window
    if actual_end > end_window:
        actual_end = end_window

    new_events: list[HealthEvent] = []
    current_date = max(today, regimen.start_date)

    # Determine doses per day
    doses_per_day = 1
    if regimen.frequency == FrequencyType.twice_daily:
        doses_per_day = 2
    elif regimen.frequency == FrequencyType.three_daily:
        doses_per_day = 3
    elif regimen.frequency == FrequencyType.weekly:
        doses_per_day = 0  # Handle weekly separately

    dose_counter = 1

    if regimen.frequency == FrequencyType.weekly:
        # Generate weekly events
        while current_date <= actual_end:
            schedule_key = f"med-{regimen.id}-{current_date.isoformat()}-1"
            if schedule_key not in existing_keys:
                status = compute_status(current_date, completed=False, today=today)
                event = HealthEvent(
                    dependent_id=regimen.dependent_id,
                    household_id=regimen.household_id,
                    name=f"{regimen.medicine_name} - {regimen.dosage}",
                    schedule_key=schedule_key,
                    category=EventCategory.medicine_dose,
                    dose_number=dose_counter,
                    due_date=current_date,
                    window_start=current_date,
                    window_end=current_date + timedelta(days=1),
                    status=status,
                    schedule_version="medicine_v1",
                )
                session.add(event)
                new_events.append(event)
            current_date += timedelta(days=7)
            dose_counter += 1
    else:
        # Generate daily/multiple-daily events
        while current_date <= actual_end:
            for dose_num in range(1, doses_per_day + 1):
                schedule_key = f"med-{regimen.id}-{current_date.isoformat()}-{dose_num}"
                if schedule_key not in existing_keys:
                    status = compute_status(current_date, completed=False, today=today)
                    event = HealthEvent(
                        dependent_id=regimen.dependent_id,
                        household_id=regimen.household_id,
                        name=f"{regimen.medicine_name} - {regimen.dosage}",
                        schedule_key=schedule_key,
                        category=EventCategory.medicine_dose,
                        dose_number=dose_counter,
                        due_date=current_date,
                        window_start=current_date,
                        window_end=current_date + timedelta(days=1),
                        status=status,
                        schedule_version="medicine_v1",
                    )
                    session.add(event)
                    new_events.append(event)
                dose_counter += 1
            current_date += timedelta(days=1)

    await session.flush()
    all_events = list(existing_events) + new_events
    all_events.sort(key=lambda e: e.due_date)
    return all_events


async def generate_growth_check_schedule(
    dependent: Dependent,
    session: AsyncSession,
) -> list[HealthEvent]:
    """Generate growth check schedule based on child's age."""
    if dependent.type != DependentType.child:
        return []

    growth_data = _load_growth_schedule()
    intervals = growth_data.get("intervals", [])

    # Fetch existing growth check events
    result = await session.execute(
        select(HealthEvent).where(
            HealthEvent.dependent_id == dependent.id,
            HealthEvent.category == EventCategory.growth_check,
        )
    )
    existing_events = result.scalars().all()
    existing_keys = {e.schedule_key for e in existing_events}

    dob = dependent.date_of_birth
    today = date.today()
    age_days = (today - dob).days
    age_months = age_days // 30

    new_events: list[HealthEvent] = []

    # Find applicable interval
    for interval in intervals:
        if interval["age_start_months"] <= age_months < interval["age_end_months"]:
            interval_days = interval["interval_days"]

            # Generate checks from birth to 1 year ahead
            check_date = dob
            check_num = 1
            max_date = today + timedelta(days=365)

            while check_date <= max_date:
                schedule_key = f"growth-{dependent.id}-{check_date.isoformat()}"
                if schedule_key not in existing_keys and check_date >= dob:
                    status = compute_status(check_date, completed=False, today=today)
                    event = HealthEvent(
                        dependent_id=dependent.id,
                        household_id=dependent.household_id,
                        name=f"Growth Check #{check_num}",
                        schedule_key=schedule_key,
                        category=EventCategory.growth_check,
                        dose_number=check_num,
                        due_date=check_date,
                        window_start=check_date - timedelta(days=7),
                        window_end=check_date + timedelta(days=7),
                        status=status,
                        schedule_version=growth_data.get("version", "growth_v1"),
                    )
                    session.add(event)
                    new_events.append(event)

                check_date += timedelta(days=interval_days)
                check_num += 1
            break

    await session.flush()
    all_events = list(existing_events) + new_events
    all_events.sort(key=lambda e: e.due_date)
    return all_events
