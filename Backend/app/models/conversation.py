import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel

class Conversation(SQLModel, table=True):
    """Stores voice conversation turns for health memory context."""

    __tablename__ = "conversations"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    household_id: str = Field(foreign_key="households.id", index=True)
    role: str = Field(description="user or assistant")
    content: str = Field(description="The transcript text")
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )

class HealthNote(SQLModel, table=True):
    """
    Distilled health facts learned by the AI about a family.
    Example: 'Aarav has a strawberry allergy.'
    """
    __tablename__ = "health_notes"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
    )
    household_id: str = Field(foreign_key="households.id", index=True)
    note: str = Field(max_length=1000)
    created_at: datetime = Field(default_factory=datetime.utcnow)
