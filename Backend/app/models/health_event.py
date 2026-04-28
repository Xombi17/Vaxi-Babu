import uuid
from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class EventStatus(str, Enum):
    upcoming = "upcoming"
    due = "due"
    overdue = "overdue"
    completed = "completed"


class VerificationStatus(str, Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


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
    completed_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True))
    )
    completed_by: str | None = Field(default=None, max_length=200, description="Name of healthcare worker")
    location: str | None = Field(default=None, max_length=200, description="Where it was done")

    notes: str | None = Field(default=None, max_length=500)

    # Verification fields (for ASHA worker verification)
    verification_status: VerificationStatus = Field(default=VerificationStatus.pending)
    verified_by: str | None = Field(default=None, max_length=200, description="ASHA worker name")
    verification_document_url: str | None = Field(default=None, max_length=500, description="URL to verification document")
    verification_notes: str | None = Field(default=None, max_length=500, description="Notes from verification")
    marked_given_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True)), description="When marked as given by parent"
    )

    # Schedule engine versioning
    schedule_version: str = Field(default="india_nis_v1", max_length=50)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
