import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class UserType(str, Enum):
    family = "family"
    asha = "asha"
    anganwadi = "anganwadi"
    health_worker = "health_worker"

    @classmethod
    def from_string(cls, value: str) -> "UserType":
        value_lower = value.lower()
        if value_lower in ("asha", "ashaworker", "asha_worker"):
            return cls.asha
        if value_lower in ("anganwadi", "anganwadi_worker"):
            return cls.anganwadi
        if value_lower in ("health_worker", "healthworker", "hw"):
            return cls.health_worker
        return cls.family


class Household(SQLModel, table=True):
    """Represents a family unit / household that acts as a user account."""

    __tablename__ = "households"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    password_hash: str = Field(min_length=8)
    auth_id: uuid.UUID | None = Field(default=None, unique=True, index=True, description="Neon Auth user ID")
    name: str = Field(min_length=1, max_length=200, description="Family / household name")
    primary_language: str = Field(default="en", max_length=10, description="BCP-47 language code")
    user_type: UserType = Field(
        default=UserType.family, description="Type of user: family, asha, anganwadi, health_worker"
    )
    village_town: str | None = Field(default=None, max_length=200)
    state: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)

    # Preferences and onboarding data
    preferences: dict = Field(default_factory=dict, sa_column=Column(JSON))
    last_onboarded_at: datetime | None = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
