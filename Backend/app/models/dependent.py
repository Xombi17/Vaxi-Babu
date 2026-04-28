import uuid
from datetime import date, datetime, timezone
from enum import Enum

from pydantic import field_validator
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class DependentType(str, Enum):
    child = "child"
    adult = "adult"
    elder = "elder"
    pregnant = "pregnant"

    @classmethod
    def from_string(cls, value: str) -> "DependentType":
        value_lower = value.lower()
        if value_lower in ("child", "adult", "elder", "pregnant"):
            return cls(value_lower)
        if value_lower in ("baby", "infant", "newborn"):
            return cls.child
        if value_lower in ("senior", "elderly"):
            return cls.elder
        if value_lower in ("pregnant", "pregnant_woman", "expecting"):
            return cls.pregnant
        return cls(value_lower)


class Sex(str, Enum):
    male = "M"
    female = "F"
    other = "other"

    @classmethod
    def from_string(cls, value: str) -> "Sex":
        value_lower = value.lower()
        if value_lower in ("m", "male", "boy"):
            return cls.male
        if value_lower in ("f", "female", "girl", "woman"):
            return cls.female
        return cls.other


class Dependent(SQLModel, table=True):
    """A person in the household whose health events are tracked."""

    __tablename__ = "dependents"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    household_id: str = Field(foreign_key="households.id", index=True)
    name: str = Field(min_length=1, max_length=200)
    type: DependentType = Field(default=DependentType.child)
    date_of_birth: date
    sex: Sex = Field(default=Sex.female)

    # Pregnancy-specific (nullable for non-pregnant dependents)
    expected_delivery_date: date | None = Field(default=None)

    notes: str | None = Field(default=None, max_length=500)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )

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
