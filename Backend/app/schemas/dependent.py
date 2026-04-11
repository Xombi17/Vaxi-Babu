from datetime import date, datetime

from pydantic import BaseModel, Field

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
