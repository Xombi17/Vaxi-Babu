import uuid
from datetime import date, datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class EventStatus(str, Enum):
    upcoming = "upcoming"
    due = "due"
    overdue = "overdue"
    completed = "completed"


class EventCategory(str, Enum):
    vaccination = "vaccination"
    checkup = "checkup"
    vitamin = "vitamin"
    reminder = "reminder"
    prenatal_checkup = "prenatal_checkup"
    medicine_dose = "medicine_dose"
    growth_check = "growth_check"
    supplement = "supplement"


class HealthEvent(SQLModel, table=True):
    """A single health action on a dependent's timeline (vaccination, checkup, etc.)."""

    __tablename__ = "health_events"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    dependent_id: str = Field(foreign_key="dependents.id", index=True)
    household_id: str = Field(foreign_key="households.id", index=True)

    # Event identity
    name: str = Field(max_length=300, description="Human-readable event name, e.g. 'BCG Vaccine'")
    schedule_key: str = Field(max_length=100, description="Key from NIS schedule, e.g. 'bcg_birth'")
    category: EventCategory = Field(default=EventCategory.vaccination)
    dose_number: int | None = Field(default=None, description="Dose number if multi-dose vaccine")

    # Timing
    due_date: date
    window_start: date | None = Field(default=None, description="Earliest acceptable date")
    window_end: date | None = Field(default=None, description="Latest acceptable date")

    # Status
    status: EventStatus = Field(default=EventStatus.upcoming)
    completed_at: datetime | None = Field(default=None)
    completed_by: str | None = Field(default=None, max_length=200, description="Name of healthcare worker")
    location: str | None = Field(default=None, max_length=200, description="Where it was done")

    notes: str | None = Field(default=None, max_length=500)

    # Schedule engine versioning
    schedule_version: str = Field(default="india_nis_v1", max_length=50)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
