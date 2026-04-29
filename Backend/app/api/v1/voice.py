"""
Gemini Live Voice Tool Handler
-------------------------------
Handles tool calls from Gemini Live on the frontend.
Gemini Live runs entirely on the client side and calls these endpoints for data.
"""

from datetime import date, datetime
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.auth import get_current_household
from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import EventStatus, HealthEvent
from app.models.household import Household

log = structlog.get_logger()
router = APIRouter(prefix="/voice", tags=["Voice (Gemini Live)"])


@router.post("/tools/get-household-dependents")
async def get_household_dependents(
    request: Request,
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Get list of dependents for a household. Requires authentication."""
    try:
        payload = await request.json()
    except Exception as e:
        log.error("json_parse_failed", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON")

    household_id = payload.get("household_id", "")
    if not household_id:
        return {"error": "household_id is required"}

    # Enforce ownership — caller may only read their own household
    if household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")

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

        log.debug("dependents_fetched", count=len(children))
        return {"dependents": children}
    except Exception as e:
        log.error("dependents_fetch_failed", error=str(e))
        return {"error": "Failed to fetch dependents"}


@router.post("/tools/get-child-vaccination-status")
async def get_child_vaccination_status(
    request: Request,
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Get vaccination status for a child. Requires authentication."""
    try:
        payload = await request.json()
    except Exception as e:
        log.error("json_parse_failed", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON")

    household_id = payload.get("household_id", "")
    dependent_id = payload.get("dependent_id", "")

    if not household_id or not dependent_id:
        return {"error": "household_id and dependent_id are required"}

    # Enforce ownership — caller may only read their own household
    if household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        # Fetch the dependent and verify it belongs to this household
        dep_stmt = select(Dependent).where(
            Dependent.id == dependent_id,
            Dependent.household_id == household_id,
        )
        dep_result = await session.execute(dep_stmt)
        if not dep_result.scalars().first():
            return {"error": "Dependent not found"}

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

        log.debug("vaccination_status_fetched", total=len(events))
        return {
            "total": len(events),
            "completed": len(completed),
            "dueNow": due,
            "overdue": overdue,
            "upcoming": upcoming[:5],
        }
    except Exception as e:
        log.error("vaccination_status_fetch_failed", error=str(e))
        return {"error": "Failed to fetch vaccination status"}
