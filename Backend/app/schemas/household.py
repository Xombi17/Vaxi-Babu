from datetime import datetime

from pydantic import BaseModel, Field

# ─── Request schemas ─────────────────────────────────────────────────────────

class HouseholdCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    primary_language: str = Field(default="en", max_length=10)
    village_town: str | None = Field(default=None, max_length=200)
    state: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)


class HouseholdUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    primary_language: str | None = Field(default=None, max_length=10)
    village_town: str | None = None
    state: str | None = None
    district: str | None = None


# ─── Response schemas ─────────────────────────────────────────────────────────

class HouseholdResponse(BaseModel):
    id: str
    name: str
    primary_language: str
    village_town: str | None
    state: str | None
    district: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
