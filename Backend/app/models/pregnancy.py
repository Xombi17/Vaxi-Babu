import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, DateTime
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

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )

    @property
    def pregnancy_week(self) -> int:
        """Current pregnancy week based on LMP."""
        lmp = self.lmp_date
        if isinstance(lmp, datetime):
            lmp = lmp.date()
        days_since_lmp = (date.today() - lmp).days
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
        due = self.expected_due_date
        if isinstance(due, datetime):
            due = due.date()
        return (due - date.today()).days
