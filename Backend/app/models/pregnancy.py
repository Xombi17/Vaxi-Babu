import uuid
from datetime import date, datetime, timedelta
from enum import Enum

from sqlmodel import Field, SQLModel


class PregnancyProfile(SQLModel, table=True):
    """Pregnancy tracking profile for a household."""

    __tablename__ = "pregnancy_profiles"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    household_id: str = Field(foreign_key="households.id", index=True)
    lmp_date: date = Field(description="Last Menstrual Period date")
    expected_due_date: date = Field(description="Computed: LMP + 280 days")
    high_risk_flags: str = Field(default="", max_length=500, description="Comma-separated risk flags")
    completed: bool = Field(default=False, description="True after delivery")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def pregnancy_week(self) -> int:
        """Current pregnancy week based on LMP."""
        days_since_lmp = (date.today() - self.lmp_date).days
        return days_since_lmp // 7

    @property
    def trimester(self) -> int:
        """Current trimester (1, 2, or 3)."""
        week = self.pregnancy_week
        if week <= 12:
            return 1
        elif week <= 26:
            return 2
        else:
            return 3

    @property
    def days_until_due(self) -> int:
        """Days remaining until expected due date."""
        return (self.expected_due_date - date.today()).days
