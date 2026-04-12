from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field


class ReminderType(str, Enum):
    health_event = "health_event"
    medicine = "medicine"
    checkup = "checkup"
    vitamin = "vitamin"


class ReminderStatus(str, Enum):
    pending = "pending"
    snoozed = "snoozed"
    acknowledged = "acknowledged"
    completed = "completed"


class ReminderCreate(BaseModel):
    dependent_id: str
    household_id: str
    reminder_type: ReminderType = ReminderType.health_event
    event_name: str = Field(max_length=300)
    medicine_name: str | None = Field(default=None, max_length=200)
    dosage: str | None = Field(default=None, max_length=100)
    frequency: str | None = Field(default=None, max_length=100)
    due_date: date
    scheduled_time: str | None = Field(default=None, max_length=50)
    health_event_id: str | None = Field(default=None)


class ReminderUpdate(BaseModel):
    status: ReminderStatus | None = None
    snoozed_until: date | None = None
    event_name: str | None = None
    medicine_name: str | None = None
    dosage: str | None = None
    frequency: str | None = None


class ReminderResponse(BaseModel):
    id: str
    dependent_id: str
    household_id: str
    reminder_type: ReminderType
    event_name: str
    medicine_name: str | None
    dosage: str | None
    frequency: str | None
    due_date: date
    scheduled_time: str | None
    status: ReminderStatus
    snoozed_until: date | None
    health_event_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
