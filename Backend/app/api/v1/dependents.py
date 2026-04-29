from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.auth import get_current_household
from app.core.database import get_session
from app.models.dependent import Dependent, DependentType
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
from app.services.health_schedule.engine import generate_and_save_schedule, generate_pregnancy_schedule

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

    # Auto-generate health schedule based on dependent type
    if dependent.type == DependentType.child:
        await generate_and_save_schedule(dependent, session)
    elif dependent.type == DependentType.pregnant:
        # For pregnant, we need LMP date - use due_date as proxy if provided
        if dependent.date_of_birth:  # Due date encoded as DOB
            await generate_pregnancy_schedule(dependent, dependent.date_of_birth, session)

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

    # Fetch health events for stats
    query = select(HealthEvent).where(HealthEvent.dependent_id == dependent_id)
    result = await session.execute(query)
    events = result.scalars().all()

    total_events = len(events)
    completed_events = len([e for e in events if e.status == EventStatus.completed])
    overdue_count = len([e for e in events if e.status == EventStatus.overdue])

    # Calculate status and score
    # Simple logic: 100 if all done, less if overdue or many upcoming
    health_score = (completed_events / total_events * 100) if total_events > 0 else 100
    status_color = "green"
    if overdue_count > 0:
        status_color = "red"
    elif completed_events < total_events * 0.5:
        status_color = "yellow"

    # Find next due
    upcoming_events = [
        e
        for e in events
        if e.status in (EventStatus.upcoming, EventStatus.due, EventStatus.overdue)
    ]
    upcoming_events.sort(key=lambda x: x.due_date)
    next_event = upcoming_events[0] if upcoming_events else None

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
