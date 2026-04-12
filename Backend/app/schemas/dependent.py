from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.models.dependent import DependentType, Sex

# ─── Request schemas ─────────────────────────────────────────────────────────


class DependentCreate(BaseModel):
    household_id: str
    name: str = Field(min_length=1, max_length=200)
    type: DependentType = DependentType.child
    date_of_birth: date
    sex: Sex = Sex.female
    expected_delivery_date: date | None = None
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("sex", mode="before")
    @classmethod
    def parse_sex(cls, v: str) -> Sex:
        if isinstance(v, Sex):
            return v
        if v is None:
            return Sex.other
        return Sex.from_string(v)

    @field_validator("type", mode="before")
    @classmethod
    def parse_type(cls, v: str) -> DependentType:
        if isinstance(v, DependentType):
            return v
        if v is None:
            return DependentType.child
        return DependentType.from_string(v)


class DependentUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    expected_delivery_date: date | None = None
    notes: str | None = Field(default=None, max_length=500)


# ─── Response schemas ─────────────────────────────────────────────────────────


class DependentResponse(BaseModel):
    id: str
    household_id: str
    name: str
    type: DependentType
    date_of_birth: date
    sex: Sex
    expected_delivery_date: date | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HealthPassStats(BaseModel):
    total_events: int
    completed_events: int
    overdue_count: int
    health_score: int
    status_color: str


class HealthPassNextDue(BaseModel):
    name: str | None
    date: date | None


class HealthPassResponse(BaseModel):
    dependent: DependentResponse
    stats: HealthPassStats
    next_due: HealthPassNextDue
