import uuid
from datetime import date, datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class ReminderStatus(str, Enum):
    pending = "pending"
    snoozed = "snoozed"
    acknowledged = "acknowledged"
    completed = "completed"


class Reminder(SQLModel, table=True):
    """A pending reminder for a household about an upcoming health event."""

    __tablename__ = "reminders"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    health_event_id: str = Field(foreign_key="health_events.id", index=True)
    dependent_id: str = Field(foreign_key="dependents.id", index=True)
    household_id: str = Field(foreign_key="households.id", index=True)

    event_name: str = Field(max_length=300)
    due_date: date

    status: ReminderStatus = Field(default=ReminderStatus.pending)
    snoozed_until: date | None = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
