import uuid
from datetime import date, datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class DependentType(str, Enum):
    child = "child"
    adult = "adult"
    elder = "elder"
    pregnant = "pregnant"


class Sex(str, Enum):
    male = "M"
    female = "F"
    other = "other"


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

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
