from datetime import date, datetime

from pydantic import BaseModel

from app.models.health_event import EventCategory, EventStatus, VerificationStatus


class HealthEventResponse(BaseModel):
    id: str
    dependent_id: str
    household_id: str
    name: str
    schedule_key: str
    category: EventCategory
    dose_number: int | None
    due_date: date
    window_start: date | None
    window_end: date | None
    status: EventStatus
    completed_at: datetime | None
    completed_by: str | None
    location: str | None
    notes: str | None
    verification_status: VerificationStatus | None
    verified_by: str | None
    verification_document_url: str | None
    verification_notes: str | None
    marked_given_at: datetime | None
    schedule_version: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TimelineResponse(BaseModel):
    dependent_id: str
    dependent_name: str
    generated_at: datetime
    events: list[HealthEventResponse]
    next_due: HealthEventResponse | None = None   # Most urgent upcoming event


class MarkCompleteRequest(BaseModel):
    completed_by: str | None = None
    location: str | None = None
    notes: str | None = None


class MarkGivenRequest(BaseModel):
    """Request to mark a vaccination as given by parent"""
    pass


class VerifyVaccinationRequest(BaseModel):
    """Request to verify a vaccination by ASHA worker"""
    verified_by: str
    verification_notes: str | None = None
    verification_document_url: str | None = None
