"""
Gemini Live Voice Tool Handler
-------------------------------
Handles tool calls from Gemini Live on the frontend.
Gemini Live runs entirely on the client side and calls these endpoints for data.
"""

from datetime import date
from typing import Any

import structlog
from fastapi import APIRouter, HTTPException, Request
from sqlmodel import select

from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import EventStatus, HealthEvent

log = structlog.get_logger()
router = APIRouter(prefix="/voice", tags=["Voice (Gemini Live)"])


@router.post("/tools/get-household-dependents")
async def get_household_dependents(request: Request) -> dict[str, Any]:
    """Get list of dependents for a household."""
    try:
        payload = await request.json()
    except Exception as e:
        log.error("json_parse_failed", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON")

    household_id = payload.get("household_id", "")
    if not household_id:
        return {"error": "household_id is required"}

    async for session in get_session():
        try:
            stmt = select(Dependent).where(Dependent.household_id == household_id)
            result = await session.execute(stmt)
            dependents = result.scalars().all()

            children = []
            today = date.today()
            for d in dependents:
                dob = d.date_of_birth
                if isinstance(dob, datetime):
                    dob = dob.date()
                age_days = (today - dob).days
                age_months = age_days // 30 if age_days >= 30 else 0

                children.append({
                    "name": d.name,
                    "age_months": age_months,
                    "dependent_id": d.id,
                })

            log.info("dependents_fetched", household_id=household_id, count=len(children))
            return {"dependents": children}
        except Exception as e:
            log.error("dependents_fetch_failed", household_id=household_id, error=str(e))
            return {"error": "Failed to fetch dependents"}
        finally:
            break

    return {"dependents": []}


@router.post("/tools/get-child-vaccination-status")
async def get_child_vaccination_status(request: Request) -> dict[str, Any]:
    """Get vaccination status for a child."""
    try:
        payload = await request.json()
    except Exception as e:
        log.error("json_parse_failed", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON")

    household_id = payload.get("household_id", "")
    dependent_id = payload.get("dependent_id", "")

    if not household_id or not dependent_id:
        return {"error": "household_id and dependent_id are required"}

    async for session in get_session():
        try:
            stmt = (
                select(HealthEvent)
                .where(HealthEvent.dependent_id == dependent_id)
                .order_by(HealthEvent.due_date)
            )
            result = await session.execute(stmt)
            events = result.scalars().all()

            overdue = [
                {"vaccine": e.name, "dose": e.dose_number or 1, "dueDate": str(e.due_date)}
                for e in events if e.status == EventStatus.overdue
            ]
            due = [
                {"vaccine": e.name, "dose": e.dose_number or 1, "dueDate": str(e.due_date)}
                for e in events if e.status == EventStatus.due
            ]
            upcoming = [
                {"vaccine": e.name, "dose": e.dose_number or 1, "dueDate": str(e.due_date)}
                for e in events if e.status == EventStatus.upcoming
            ]
            completed = [e for e in events if e.status == EventStatus.completed]

            log.info("vaccination_status_fetched", dependent_id=dependent_id, total=len(events))
            return {
                "total": len(events),
                "completed": len(completed),
                "dueNow": due,
                "overdue": overdue,
                "upcoming": upcoming[:5],
            }
        except Exception as e:
            log.error("vaccination_status_fetch_failed", dependent_id=dependent_id, error=str(e))
            return {"error": "Failed to fetch vaccination status"}
        finally:
            break

    return {"error": "Failed to fetch vaccination status"}
