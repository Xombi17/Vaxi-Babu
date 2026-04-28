import uuid
from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class ReminderStatus(str, Enum):
    pending = "pending"
    snoozed = "snoozed"
    acknowledged = "acknowledged"
    completed = "completed"


class ReminderType(str, Enum):
    health_event = "health_event"
    medicine = "medicine"
    checkup = "checkup"
    vitamin = "vitamin"


class Reminder(SQLModel, table=True):
    """A pending reminder for a household about an upcoming health event or medicine."""

    __tablename__ = "reminders"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    health_event_id: str | None = Field(default=None, foreign_key="health_events.id", index=True)
    dependent_id: str = Field(foreign_key="dependents.id", index=True)
    household_id: str = Field(foreign_key="households.id", index=True)

    reminder_type: ReminderType = Field(default=ReminderType.health_event)
    event_name: str = Field(max_length=300)
    medicine_name: str | None = Field(
        default=None, max_length=200, description="Name of medicine for adherence tracking"
    )
    dosage: str | None = Field(default=None, max_length=100, description="Dosage instructions")
    frequency: str | None = Field(default=None, max_length=100, description="How often (daily, twice daily, etc)")

    due_date: date
    scheduled_time: str | None = Field(
        default=None, max_length=50, description="Time of day for reminder (morning, afternoon, evening)"
    )

    status: ReminderStatus = Field(default=ReminderStatus.pending)
    snoozed_until: date | None = Field(default=None)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
