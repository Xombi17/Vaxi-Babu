from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class UserType(str, Enum):
    family = "family"
    asha = "asha"
    anganwadi = "anganwadi"
    health_worker = "health_worker"


# ─── Request schemas ─────────────────────────────────────────────────────────


class HouseholdCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    primary_language: str = Field(default="en", max_length=10)
    user_type: UserType = Field(default=UserType.family)
    username: str = Field(..., max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    village_town: str | None = Field(default=None, max_length=200)
    state: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)


class HouseholdUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    primary_language: str | None = Field(default=None, max_length=10)
    user_type: UserType | None = Field(default=None)
    village_town: str | None = None
    state: str | None = None
    district: str | None = None
    preferences: dict | None = None
    last_onboarded_at: datetime | None = None


class HouseholdPreferences(BaseModel):
    ai_tone: str = Field(default="simple")
    language: str = Field(default="en")  # en, hi, mr
    voice_mode: str = Field(default="regional")
    health_focus: str = Field(default="general")


# ─── Response schemas ─────────────────────────────────────────────────────────


class HouseholdResponse(BaseModel):
    id: str
    username: str | None
    name: str
    primary_language: str
    user_type: UserType
    village_town: str | None
    state: str | None
    district: str | None
    preferences: dict
    last_onboarded_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
