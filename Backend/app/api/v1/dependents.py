from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.auth import get_current_household
from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import HealthEvent, EventStatus
from app.models.household import Household
from app.schemas.dependent import (
    DependentCreate,
    DependentResponse,
    DependentUpdate,
    HealthPassResponse,
    HealthPassStats,
    HealthPassNextDue,
)

router = APIRouter(prefix="/dependents", tags=["Dependents"])


@router.post("", response_model=DependentResponse, status_code=status.HTTP_201_CREATED)
async def create_dependent(
    body: DependentCreate,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> Dependent:
    if body.household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    dependent = Dependent(**body.model_dump())
    session.add(dependent)
    await session.flush()
    await session.refresh(dependent)

    return dependent


@router.get("", response_model=list[DependentResponse])
async def list_dependents(
    household_id: str | None = None,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> list[Dependent]:
    query = select(Dependent).order_by(Dependent.created_at)
    effective_household_id = household_id or current_household.id
    query = query.where(Dependent.household_id == effective_household_id)
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/{dependent_id}", response_model=DependentResponse)
async def get_dependent(
    dependent_id: str,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> Dependent:
    dep = await session.get(Dependent, dependent_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")
    if dep.household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return dep


@router.patch("/{dependent_id}", response_model=DependentResponse)
async def update_dependent(
    dependent_id: str,
    body: DependentUpdate,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> Dependent:
    dep = await session.get(Dependent, dependent_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")
    if dep.household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dep, field, value)
    dep.updated_at = datetime.now(timezone.utc)
    await session.merge(dep)
    await session.flush()
    return dep


@router.delete("/{dependent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dependent(
    dependent_id: str,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> None:
    dep = await session.get(Dependent, dependent_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")
    if dep.household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await session.delete(dep)


@router.get("/{dependent_id}/pass", response_model=HealthPassResponse)
async def get_health_pass(
    dependent_id: str,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> HealthPassResponse:
    dep = await session.get(Dependent, dependent_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")
    if dep.household_id != current_household.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # OPTIMIZATION: Use SQL GROUP BY to count statuses — avoids loading all rows into memory.
    # Previously: SELECT * FROM health_events WHERE dependent_id = ?  (O(N) rows)
    # Now:        SELECT status, COUNT(*) GROUP BY status            (O(distinct statuses) rows)
    status_counts_query = (
        select(HealthEvent.status, func.count(HealthEvent.id).label("cnt"))
        .where(HealthEvent.dependent_id == dependent_id)
        .group_by(HealthEvent.status)
    )
    status_counts_result = await session.execute(status_counts_query)
    status_counts: dict[str, int] = {
        row.status: row.cnt for row in status_counts_result.all()
    }

    total_events = sum(status_counts.values())
    completed_events = status_counts.get(EventStatus.completed, 0)
    overdue_count = status_counts.get(EventStatus.overdue, 0)

    # Calculate status and score
    health_score = (completed_events / total_events * 100) if total_events > 0 else 100
    status_color = "green"
    if overdue_count > 0:
        status_color = "red"
    elif completed_events < total_events * 0.5:
        status_color = "yellow"

    # OPTIMIZATION: Fetch only the single next-due event with ORDER BY + LIMIT 1.
    # Previously: sorted all upcoming events in Python.
    next_event_query = (
        select(HealthEvent)
        .where(
            HealthEvent.dependent_id == dependent_id,
            HealthEvent.status.in_(
                [EventStatus.upcoming, EventStatus.due, EventStatus.overdue]
            ),
        )
        .order_by(HealthEvent.due_date.asc())
        .limit(1)
    )
    next_event_result = await session.execute(next_event_query)
    next_event = next_event_result.scalar_one_or_none()

    return HealthPassResponse(
        dependent=dep,
        stats=HealthPassStats(
            total_events=total_events,
            completed_events=completed_events,
            overdue_count=overdue_count,
            health_score=int(health_score),
            status_color=status_color,
        ),
        next_due=HealthPassNextDue(
            name=next_event.name if next_event else None,
            date=next_event.due_date if next_event else None,
        ),
    )
