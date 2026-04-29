"""
CHW / ASHA Worker API
---------------------
Provides a CHW-specific view of all households in the same district/village.
Powers the CHW Mode dashboard: household list, at-risk flagging, field reports, compliance export.
"""

import csv
import io
from datetime import date, datetime, timezone
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_household
from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import EventStatus, HealthEvent
from app.models.household import Household, UserType
from app.services.ai_service import answer_voice_question

log = structlog.get_logger()
router = APIRouter(prefix="/chw", tags=["CHW / ASHA Worker"])

# ─── Helpers ──────────────────────────────────────────────────────────────────

AT_RISK_THRESHOLD = 2  # households with >= N overdue events are flagged at-risk


def _is_chw(household: Household) -> bool:
    """Returns True if the account is any kind of health worker."""
    return household.user_type in (
        UserType.asha,
        UserType.anganwadi,
        UserType.health_worker,
    )


async def _household_health_summary(
    household: Household,
    session: AsyncSession,
) -> dict[str, Any]:
    """Compute health status summary for a single household."""
    dep_stmt = select(Dependent).where(Dependent.household_id == household.id)
    dep_result = await session.execute(dep_stmt)
    dependents = dep_result.scalars().all()

    total_events = 0
    completed_events = 0
    overdue_count = 0
    due_count = 0

    dependent_summaries = []
    for dep in dependents:
        ev_stmt = select(HealthEvent).where(HealthEvent.dependent_id == dep.id)
        ev_result = await session.execute(ev_stmt)
        events = ev_result.scalars().all()

        dep_total = len(events)
        dep_completed = sum(1 for e in events if e.status == EventStatus.completed)
        dep_overdue = sum(1 for e in events if e.status == EventStatus.overdue)
        dep_due = sum(1 for e in events if e.status == EventStatus.due)

        total_events += dep_total
        completed_events += dep_completed
        overdue_count += dep_overdue
        due_count += dep_due

        dob = dep.date_of_birth
        if isinstance(dob, datetime):
            dob = dob.date()
        age_days = (date.today() - dob).days

        dependent_summaries.append({
            "name": dep.name,
            "type": dep.type.value,
            "age_months": age_days // 30,
            "overdue": dep_overdue,
            "due": dep_due,
            "completed": dep_completed,
            "total": dep_total,
        })

    health_score = round((completed_events / total_events) * 100) if total_events else 100
    is_at_risk = overdue_count >= AT_RISK_THRESHOLD

    if is_at_risk:
        status_color = "red"
    elif overdue_count > 0 or due_count > 0:
        status_color = "amber"
    else:
        status_color = "green"

    return {
        "household_id": household.id,
        "household_name": household.name,
        "village_town": household.village_town,
        "district": household.district,
        "state": household.state,
        "total_members": len(dependents),
        "total_events": total_events,
        "completed_events": completed_events,
        "overdue_count": overdue_count,
        "due_count": due_count,
        "health_score": health_score,
        "is_at_risk": is_at_risk,
        "status_color": status_color,
        "dependents": dependent_summaries,
        "last_onboarded_at": household.last_onboarded_at.isoformat() if household.last_onboarded_at else None,
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/households")
async def get_managed_households(
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """
    D1/D2 — Get all households in the same district/state with health status.
    At-risk households (2+ overdue events) appear first.
    Requires CHW/ASHA/health_worker account type.
    """
    if not _is_chw(current_household):
        raise HTTPException(
            status_code=403,
            detail="CHW mode requires an ASHA, Anganwadi, or Health Worker account."
        )

    # Fetch households in the same district/state (geographic scope)
    stmt = select(Household).where(
        Household.id != current_household.id  # exclude self
    )
    if current_household.district:
        stmt = stmt.where(Household.district == current_household.district)
    elif current_household.state:
        stmt = stmt.where(Household.state == current_household.state)

    result = await session.execute(stmt)
    households = result.scalars().all()

    summaries = []
    for hh in households:
        try:
            summary = await _household_health_summary(hh, session)
            summaries.append(summary)
        except Exception as e:
            log.warning("chw_household_summary_failed", household_id=hh.id, error=str(e))

    # Sort: at-risk first, then by overdue count desc, then by health_score asc
    summaries.sort(key=lambda x: (not x["is_at_risk"], -x["overdue_count"], x["health_score"]))

    at_risk_count = sum(1 for s in summaries if s["is_at_risk"])
    total_overdue = sum(s["overdue_count"] for s in summaries)

    log.info("chw_households_fetched", count=len(summaries), at_risk=at_risk_count)
    return {
        "worker": {
            "name": current_household.name,
            "type": current_household.user_type.value,
            "district": current_household.district,
            "state": current_household.state,
        },
        "households": summaries,
        "stats": {
            "total_households": len(summaries),
            "at_risk": at_risk_count,
            "on_track": len(summaries) - at_risk_count,
            "total_overdue_events": total_overdue,
        },
    }


@router.get("/households/{household_id}/status")
async def get_household_status(
    household_id: str,
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """
    D2 — Get detailed health status for a single managed household.
    """
    if not _is_chw(current_household):
        raise HTTPException(status_code=403, detail="CHW access required.")

    hh = await session.get(Household, household_id)
    if not hh:
        raise HTTPException(status_code=404, detail="Household not found.")

    # Scope check — same district or state
    if current_household.district and hh.district != current_household.district:
        raise HTTPException(status_code=403, detail="Household is outside your area.")

    return await _household_health_summary(hh, session)


@router.post("/field-report")
async def generate_field_report(
    request: Request,
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """
    D3 — Generate a structured field report from a voice note.
    The CHW speaks visit notes; the AI structures them into a report object.
    """
    if not _is_chw(current_household):
        raise HTTPException(status_code=403, detail="CHW access required.")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    voice_note = (payload.get("voice_note") or "").strip()
    household_id = payload.get("household_id", "")
    language = payload.get("language", "en")

    if not voice_note:
        raise HTTPException(status_code=422, detail="voice_note is required.")

    # Get household context if provided
    visit_household_name = "Unknown"
    if household_id:
        hh = await session.get(Household, household_id)
        if hh:
            visit_household_name = hh.name

    prompt = f"""You are helping an ASHA/CHW health worker structure their field visit notes.

Worker: {current_household.name} ({current_household.user_type.value})
Visited household: {visit_household_name}
Visit date: {date.today().isoformat()}

Voice note from worker:
\"\"\"{voice_note}\"\"\"

Extract and return a structured JSON field report with these fields:
- visit_date: today's date
- worker_name: the worker's name
- household_visited: household name
- members_seen: list of names mentioned
- vaccinations_given: list of vaccines/medicines mentioned as given
- events_pending: list of health actions still pending
- observations: free-text clinical observations
- next_visit_action: recommended follow-up action
- flag_urgent: true if anything urgent needs escalation, false otherwise
- urgent_reason: reason for urgency if flag_urgent is true, else null

Return ONLY the JSON object, no extra text."""

    try:
        structured = await answer_voice_question(prompt, "", language)
        # Try to parse the AI response as JSON for validation
        import json
        try:
            report_data = json.loads(structured)
        except Exception:
            # If AI didn't return clean JSON, wrap it
            report_data = {
                "visit_date": date.today().isoformat(),
                "worker_name": current_household.name,
                "household_visited": visit_household_name,
                "raw_note": voice_note,
                "ai_summary": structured,
            }
    except Exception as e:
        log.error("field_report_ai_failed", error=str(e))
        report_data = {
            "visit_date": date.today().isoformat(),
            "worker_name": current_household.name,
            "household_visited": visit_household_name,
            "raw_note": voice_note,
            "error": "Could not structure report — raw note preserved.",
        }

    log.info("field_report_generated", worker=current_household.name, household=visit_household_name)
    return {
        "report": report_data,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/compliance-report")
async def get_compliance_report(
    current_household: Household = Depends(get_current_household),
    session: AsyncSession = Depends(get_session),
    format: str = "json",
) -> Any:
    """
    D4 — Download compliance report for all managed households.
    Supports format=json (default) or format=csv for supervisor export.
    """
    if not _is_chw(current_household):
        raise HTTPException(status_code=403, detail="CHW access required.")

    stmt = select(Household).where(Household.id != current_household.id)
    if current_household.district:
        stmt = stmt.where(Household.district == current_household.district)
    elif current_household.state:
        stmt = stmt.where(Household.state == current_household.state)

    result = await session.execute(stmt)
    households = result.scalars().all()

    rows = []
    for hh in households:
        try:
            summary = await _household_health_summary(hh, session)
            rows.append({
                "Household": summary["household_name"],
                "Village": summary["village_town"] or "-",
                "Members": summary["total_members"],
                "Total Events": summary["total_events"],
                "Completed": summary["completed_events"],
                "Overdue": summary["overdue_count"],
                "Health Score (%)": summary["health_score"],
                "Status": "At Risk" if summary["is_at_risk"] else "On Track",
            })
        except Exception:
            pass

    if format == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=rows[0].keys() if rows else [])
        writer.writeheader()
        writer.writerows(rows)
        output.seek(0)
        filename = f"chw_compliance_{date.today().isoformat()}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "worker": current_household.name,
        "district": current_household.district,
        "total_households": len(rows),
        "rows": rows,
    }
