from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


# ─── Request schemas ─────────────────────────────────────────────────────────


class GrowthRecordCreate(BaseModel):
    dependent_id: str
    household_id: str
    recorded_date: date
    height_cm: float | None = Field(default=None, ge=0, le=250)
    weight_kg: float | None = Field(default=None, ge=0, le=200)
    head_circumference_cm: float | None = Field(default=None, ge=0, le=60)
    milestone_achieved: str | None = Field(default=None, max_length=300)
    notes: str = Field(default="", max_length=500)

    @field_validator("height_cm", "weight_kg", "head_circumference_cm")
    @classmethod
    def validate_measurements(cls, v: float | None) -> float | None:
        if v is not None and v <= 0:
            raise ValueError("Measurement must be positive")
        return v


# ─── Response schemas ─────────────────────────────────────────────────────────


class GrowthRecordResponse(BaseModel):
    id: str
    dependent_id: str
    household_id: str
    recorded_date: date
    height_cm: float | None
    weight_kg: float | None
    head_circumference_cm: float | None
    milestone_achieved: str | None
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}
