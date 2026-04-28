import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class GrowthRecord(SQLModel, table=True):
    """Growth measurement record for a dependent."""

    __tablename__ = "growth_records"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    dependent_id: str = Field(foreign_key="dependents.id", index=True)
    household_id: str = Field(foreign_key="households.id", index=True)

    recorded_date: date

    height_cm: float | None = Field(default=None, description="Height in centimeters")
    weight_kg: float | None = Field(default=None, description="Weight in kilograms")
    head_circumference_cm: float | None = Field(default=None, description="Head circumference (0-2 years)")

    milestone_achieved: str | None = Field(default=None, max_length=300)
    notes: str = Field(default="", max_length=500)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
