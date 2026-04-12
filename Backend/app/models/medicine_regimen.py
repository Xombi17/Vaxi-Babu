import uuid
from datetime import date, datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class FrequencyType(str, Enum):
    daily = "daily"
    twice_daily = "twice_daily"
    three_daily = "three_daily"
    weekly = "weekly"
    as_needed = "as_needed"


class MedicineRegimen(SQLModel, table=True):
    """Medicine regimen tracking for a dependent."""

    __tablename__ = "medicine_regimens"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    dependent_id: str = Field(foreign_key="dependents.id", index=True)
    household_id: str = Field(foreign_key="households.id", index=True)

    medicine_name: str = Field(max_length=300)
    dosage: str = Field(max_length=100, description="e.g., '500mg', '1 tablet'")
    frequency: FrequencyType = Field(default=FrequencyType.daily)

    start_date: date
    end_date: date | None = Field(default=None, description="None = ongoing")

    safety_bucket: str = Field(default="", max_length=100, description="From medicine_safety classifier")
    prescribing_note: str = Field(default="", max_length=500)

    active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
