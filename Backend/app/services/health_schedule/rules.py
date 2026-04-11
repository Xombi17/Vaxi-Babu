"""
Health Schedule Rules
---------------------
Loads the India NIS schedule from data/india_nis_schedule.json and provides
pure-Python utilities for computing event due dates from a date of birth.
No database access — fully deterministic and testable.
"""

import json
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

# Load schedule once at module import time
_SCHEDULE_PATH = Path(__file__).parents[3] / "data" / "india_nis_schedule.json"
_schedule_data: dict = {}


def _load_schedule() -> dict:
    global _schedule_data
    if not _schedule_data:
        with open(_SCHEDULE_PATH, encoding="utf-8") as f:
            _schedule_data = json.load(f)
    return _schedule_data


def get_schedule_version() -> str:
    return _load_schedule()["version"]


@dataclass
class ScheduledEvent:
    """A single scheduled event, computed deterministically from DOB."""
    key: str
    name: str
    category: str
    dose_number: int | None
    due_date: date
    window_start: date
    window_end: date
    description: str
    why_it_matters: str
    what_to_expect: str


def compute_due_date(dob: date, age_value: int, age_unit: str) -> date:
    """Convert a schedule age spec into an exact calendar date."""
    if age_unit == "days":
        return dob + timedelta(days=age_value)
    elif age_unit == "weeks":
        return dob + timedelta(weeks=age_value)
    elif age_unit == "months":
        # Approximate: 1 month = 30.44 days
        return dob + timedelta(days=int(age_value * 30.4375))
    elif age_unit == "years":
        return dob + timedelta(days=int(age_value * 365.25))
    else:
        raise ValueError(f"Unknown age_unit: {age_unit}")


def generate_child_schedule(dob: date) -> list[ScheduledEvent]:
    """
    Given a child's date of birth, return the full ordered list of
    scheduled health events from the India NIS.
    """
    data = _load_schedule()
    events: list[ScheduledEvent] = []

    for vaccine in data["vaccines"]:
        due = compute_due_date(dob, vaccine["age_value"], vaccine["age_unit"])
        window_start = dob + timedelta(days=vaccine.get("window_start_days", 0))
        window_end = dob + timedelta(days=vaccine.get("window_end_days", 0)) if vaccine.get("window_end_days") else due + timedelta(days=30)

        events.append(ScheduledEvent(
            key=vaccine["key"],
            name=vaccine["name"],
            category=vaccine["category"],
            dose_number=vaccine.get("dose"),
            due_date=due,
            window_start=window_start,
            window_end=window_end,
            description=vaccine.get("description", ""),
            why_it_matters=vaccine.get("why_it_matters", ""),
            what_to_expect=vaccine.get("what_to_expect", ""),
        ))

    # Sort by due date (chronological)
    events.sort(key=lambda e: e.due_date)
    return events
