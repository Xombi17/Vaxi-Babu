"""
Gemini Live Voice Tool Handler
-------------------------------
Handles tool calls from Gemini Live on the frontend.
Gemini Live runs entirely on the client side and calls these endpoints for data.
"""

from collections import defaultdict
from datetime import date, datetime
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.auth import get_current_household
from app.core.database import get_session
from app.models.dependent import Dependent, DependentType, Sex
from app.models.health_event import EventStatus, HealthEvent
from app.models.household import Household
from app.services.ai_service import classify_medicine_with_ai, simplify_medicine_result
from app.services.medicine_safety import classify_medicine

log = structlog.get_logger()
router = APIRouter(prefix="/voice", tags=["Voice (Gemini Live)"])

# In-memory conversation memory store (keyed by household_id)
# Stores last N turns per household for B4 (visit memory)
_conversation_memory: dict[str, list[dict]] = defaultdict(list)
CONVERSATION_MEMORY_MAX_TURNS = 20


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


# ─────────────────────────────────────────────────────────────────────────────
# B1 — Today's Priority List ("What should I do today?")
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/tools/get-todays-priorities")
async def get_todays_priorities(
    request: Request,
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Return the top health priorities for today across all household dependents.
    Used by voice assistant for the 'What should I do today?' command (B1).
    """
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    household_id = payload.get("household_id", "") or current_household.id

    if household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        dep_stmt = select(Dependent).where(Dependent.household_id == household_id)
        dep_result = await session.execute(dep_stmt)
        dependents = dep_result.scalars().all()

        today = date.today()
        priorities: list[dict] = []

        for dep in dependents:
            ev_stmt = (
                select(HealthEvent)
                .where(
                    HealthEvent.dependent_id == dep.id,
                    HealthEvent.status.in_([EventStatus.overdue, EventStatus.due]),
                )
                .order_by(HealthEvent.due_date)
            )
            ev_result = await session.execute(ev_stmt)
            events = ev_result.scalars().all()

            for e in events:
                due_date = e.due_date
                if isinstance(due_date, datetime):
                    due_date = due_date.date()
                days_delta = (due_date - today).days
                if days_delta < 0:
                    urgency = "overdue"
                elif days_delta == 0:
                    urgency = "due_today"
                else:
                    urgency = "due_soon"

                priorities.append({
                    "person": dep.name,
                    "action": e.name,
                    "urgency": urgency,
                    "days_delta": days_delta,
                    "due_date": str(due_date),
                    "category": e.category.value,
                })

        # Sort: most overdue first
        priorities.sort(key=lambda x: x["days_delta"])

        log.debug("todays_priorities_fetched", count=len(priorities), household=household_id)
        return {
            "priorities": priorities[:10],
            "total_urgent": len(priorities),
            "household_name": current_household.name,
        }
    except Exception as e:
        log.error("todays_priorities_failed", error=str(e))
        return {"error": "Failed to fetch today's priorities"}


# ─────────────────────────────────────────────────────────────────────────────
# B2 — Voice-Driven Dependent Creation
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/tools/add-dependent-by-voice")
async def add_dependent_by_voice(
    request: Request,
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Create a new dependent from voice-parsed fields (B2).
    Gemini extracts name, DOB, type, sex from conversation and calls this.
    When confirmed=false (default), returns a preview for Gemini to read aloud.
    When confirmed=true, persists the record.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    household_id = payload.get("household_id", "") or current_household.id
    if household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    name = (payload.get("name") or "").strip()
    date_of_birth_str = (payload.get("date_of_birth") or "").strip()
    dep_type = (payload.get("type") or "child").strip().lower()
    sex = (payload.get("sex") or "other").strip().lower()
    confirmed = bool(payload.get("confirmed", False))

    if not name:
        return {"error": "name is required"}
    if not date_of_birth_str:
        return {"error": "date_of_birth is required in YYYY-MM-DD format"}

    try:
        dob = datetime.strptime(date_of_birth_str, "%Y-%m-%d").date()
    except ValueError:
        return {"error": f"Invalid date format: '{date_of_birth_str}'. Please use YYYY-MM-DD."}

    if dep_type not in ("child", "adult", "elder", "pregnant"):
        dep_type = "child"
    if sex not in ("male", "female", "other"):
        sex = "other"

    # Preview step — return summary for voice confirmation
    if not confirmed:
        today = date.today()
        age_days = (today - dob).days
        age_str = f"{age_days // 365} year(s)" if age_days >= 365 else f"{age_days // 30} month(s)"
        return {
            "preview": {
                "name": name,
                "date_of_birth": str(dob),
                "type": dep_type,
                "sex": sex,
                "age": age_str,
            },
            "needs_confirmation": True,
            "message": (
                f"I'm ready to add {name}: a {sex} {dep_type}, born on {dob}, "
                f"aged {age_str}. Say 'yes, confirm' to save this."
            ),
        }

    # Save the dependent
    try:
        dep = Dependent(
            household_id=household_id,
            name=name,
            type=DependentType(dep_type),
            date_of_birth=dob,
            sex=Sex(sex),
        )
        session.add(dep)
        await session.flush()
        await session.refresh(dep)

        log.info("dependent_added_by_voice", name=name, household=household_id)
        return {
            "success": True,
            "dependent_id": dep.id,
            "message": (
                f"{name} has been added to your household successfully. "
                "You can now generate their health schedule from the app."
            ),
        }
    except Exception as e:
        log.error("add_dependent_voice_failed", error=str(e))
        return {"error": f"Could not create dependent: {str(e)}"}


# ─────────────────────────────────────────────────────────────────────────────
# B3 — Voice Medicine Safety Check
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/tools/check-medicine-by-voice")
async def check_medicine_by_voice(
    request: Request,
    current_household: Household = Depends(get_current_household),
) -> dict[str, Any]:
    """Check medicine safety by name, invoked by voice (B3).
    Gemini extracts medicine name + optional concern from the spoken question.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    medicine_name = (payload.get("medicine_name") or "").strip()
    concern = payload.get("concern", None)
    language = payload.get("language", "en")

    if not medicine_name:
        return {"error": "medicine_name is required"}

    try:
        bucket, concern_checked, why_caution, next_step, confidence = classify_medicine(medicine_name, concern)

        if bucket == "insufficient_info":
            bucket, concern_checked, why_caution, next_step, confidence = await classify_medicine_with_ai(
                medicine_name, concern
            )

        try:
            simplified_why = await simplify_medicine_result(medicine_name, bucket, why_caution, language)
        except Exception:
            simplified_why = why_caution

        verdict_map = {
            "common_use": "This medicine is generally considered safe for common use.",
            "use_with_caution": "Use this medicine with caution and follow dosage instructions carefully.",
            "insufficient_info": "We don't have enough information about this medicine. Please consult a doctor or pharmacist.",
            "consult_doctor_urgently": "Please consult a doctor or pharmacist before using this medicine.",
        }
        verdict = verdict_map.get(bucket, "Please consult a healthcare professional.")

        log.info("medicine_voice_check", medicine=medicine_name, bucket=bucket)
        return {
            "medicine": medicine_name,
            "safety_bucket": bucket,
            "verdict": verdict,
            "reason": simplified_why,
            "next_step": next_step,
            "concern_checked": concern_checked,
            "disclaimer": "This is general guidance only. Always consult a doctor for medical advice.",
        }
    except Exception as e:
        log.error("medicine_voice_check_failed", error=str(e))
        return {"error": "Could not check medicine safety. Please consult a pharmacist or doctor."}


# ─────────────────────────────────────────────────────────────────────────────
# B4 — Conversation Memory (save & retrieve)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/tools/save-conversation-turn")
async def save_conversation_turn(
    request: Request,
    current_household: Household = Depends(get_current_household),
) -> dict[str, Any]:
    """Append a conversation turn to this household's in-memory log (B4)."""
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    household_id = current_household.id
    role = payload.get("role", "user")
    text = (payload.get("text") or "").strip()

    if not text:
        return {"ok": False, "reason": "empty text"}

    turns = _conversation_memory[household_id]
    turns.append({
        "role": role,
        "text": text,
        "timestamp": datetime.utcnow().isoformat(),
    })
    # Keep memory bounded
    if len(turns) > CONVERSATION_MEMORY_MAX_TURNS:
        _conversation_memory[household_id] = turns[-CONVERSATION_MEMORY_MAX_TURNS:]

    return {"ok": True, "turns_stored": len(_conversation_memory[household_id])}


@router.post("/tools/get-conversation-context")
async def get_conversation_context(
    request: Request,
    current_household: Household = Depends(get_current_household),
) -> dict[str, Any]:
    """Retrieve recent conversation turns for this household (B4 visit memory).
    Gemini uses this to reference what was discussed in prior sessions.
    """
    household_id = current_household.id
    turns = _conversation_memory.get(household_id, [])
    recent = turns[-10:] if len(turns) > 10 else turns

    if not recent:
        return {
            "has_history": False,
            "message": "No previous conversation history found for this household.",
            "turns": [],
        }

    return {
        "has_history": True,
        "turns": recent,
        "summary": f"Found {len(recent)} recent messages from your last conversation.",
    }
