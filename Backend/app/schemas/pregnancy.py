from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.models.pregnancy import PregnancyProfile


# ─── Request schemas ─────────────────────────────────────────────────────────


class PregnancyProfileCreate(BaseModel):
    household_id: str
    lmp_date: date = Field(description="Last Menstrual Period date")

    @field_validator("lmp_date")
    @classmethod
    def validate_lmp_date(cls, v: date) -> date:
        # Reject future dates
        if v > date.today():
            raise ValueError("LMP date cannot be in the future")
        # Reject dates beyond 42 weeks (294 days)
        days_since_lmp = (date.today() - v).days
        if days_since_lmp > 294:
            raise ValueError("LMP date is too far in the past (beyond 42 weeks)")
        return v


class PregnancyProfileUpdate(BaseModel):
    high_risk_flags: str | None = None
    completed: bool | None = None


# ─── Response schemas ─────────────────────────────────────────────────────────


class PregnancyProfileResponse(BaseModel):
    id: str
    household_id: str
    lmp_date: date
    expected_due_date: date
    high_risk_flags: str
    completed: bool
    pregnancy_week: int
    trimester: int
    days_until_due: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_model(cls, profile: PregnancyProfile) -> "PregnancyProfileResponse":
        return cls(
            id=profile.id,
            household_id=profile.household_id,
            lmp_date=profile.lmp_date,
            expected_due_date=profile.expected_due_date,
            high_risk_flags=profile.high_risk_flags,
            completed=profile.completed,
            pregnancy_week=profile.pregnancy_week,
            trimester=profile.trimester,
            days_until_due=profile.days_until_due,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
