from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.health_event import EventStatus, HealthEvent
from app.models.reminder import Reminder, ReminderStatus

router = APIRouter(prefix="/reminders", tags=["Reminders"])


class ReminderResponse(BaseModel):
    id: str
    health_event_id: str
    dependent_id: str
    household_id: str
    event_name: str
    due_date: date
    status: ReminderStatus

    model_config = {"from_attributes": True}


class SnoozeRequest(BaseModel):
    snooze_until: date


@router.get("", response_model=list[ReminderResponse])
async def list_reminders(
    household_id: str | None = None,
    status_filter: str | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[Reminder]:
    """List reminders, optionally filtered by household or status."""
    query = select(Reminder).order_by(Reminder.due_date)
    if household_id:
        query = query.where(Reminder.household_id == household_id)
    if status_filter:
        query = query.where(Reminder.status == status_filter)
    result = await session.exec(query)
    return result.all()


@router.post("/{reminder_id}/done", response_model=ReminderResponse)
async def mark_reminder_done(
    reminder_id: str,
    session: AsyncSession = Depends(get_session),
) -> Reminder:
    """Mark a reminder as completed and update the linked health event."""
    reminder = await session.get(Reminder, reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.status = ReminderStatus.completed
    reminder.updated_at = datetime.utcnow()
    session.add(reminder)

    # Also mark health event as completed
    event = await session.get(HealthEvent, reminder.health_event_id)
    if event:
        event.status = EventStatus.completed
        event.completed_at = datetime.utcnow()
        event.updated_at = datetime.utcnow()
        session.add(event)

    await session.flush()
    await session.refresh(reminder)
    return reminder


@router.post("/{reminder_id}/snooze", response_model=ReminderResponse)
async def snooze_reminder(
    reminder_id: str,
    body: SnoozeRequest,
    session: AsyncSession = Depends(get_session),
) -> Reminder:
    """Snooze a reminder until a specified date."""
    reminder = await session.get(Reminder, reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.status = ReminderStatus.snoozed
    reminder.snoozed_until = body.snooze_until
    reminder.updated_at = datetime.utcnow()
    session.add(reminder)
    await session.flush()
    await session.refresh(reminder)
    return reminder
