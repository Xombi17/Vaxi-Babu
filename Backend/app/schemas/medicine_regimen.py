from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.models.medicine_regimen import FrequencyType


# ─── Request schemas ─────────────────────────────────────────────────────────


class MedicineRegimenCreate(BaseModel):
    dependent_id: str
    household_id: str
    medicine_name: str = Field(min_length=1, max_length=300)
    dosage: str = Field(min_length=1, max_length=100)
    frequency: FrequencyType = FrequencyType.daily
    start_date: date
    end_date: date | None = None
    safety_bucket: str = Field(default="", max_length=100)
    prescribing_note: str = Field(default="", max_length=500)

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: date | None, info) -> date | None:
        if v is not None and "start_date" in info.data:
            start_date = info.data["start_date"]
            if v < start_date:
                raise ValueError("end_date cannot be before start_date")
        return v


class MedicineRegimenUpdate(BaseModel):
    dosage: str | None = Field(default=None, max_length=100)
    frequency: FrequencyType | None = None
    end_date: date | None = None
    prescribing_note: str | None = Field(default=None, max_length=500)
    active: bool | None = None


# ─── Response schemas ─────────────────────────────────────────────────────────


class MedicineRegimenResponse(BaseModel):
    id: str
    dependent_id: str
    household_id: str
    medicine_name: str
    dosage: str
    frequency: FrequencyType
    start_date: date
    end_date: date | None
    safety_bucket: str
    prescribing_note: str
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
