from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.household import Household
from app.schemas.dependent import DependentCreate, DependentResponse, DependentUpdate
from app.services.health_schedule.engine import generate_and_save_schedule

router = APIRouter(prefix="/dependents", tags=["Dependents"])


@router.post("", response_model=DependentResponse, status_code=status.HTTP_201_CREATED)
async def create_dependent(
    body: DependentCreate,
    session: AsyncSession = Depends(get_session),
) -> Dependent:
    # Verify household exists
    household = await session.get(Household, body.household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")

    dependent = Dependent(**body.model_dump())
    session.add(dependent)
    await session.flush()
    await session.refresh(dependent)

    # Auto-generate health schedule on dependent creation
    await generate_and_save_schedule(dependent, session)

    return dependent


@router.get("", response_model=list[DependentResponse])
async def list_dependents(
    household_id: str | None = None,
    session: AsyncSession = Depends(get_session),
) -> list[Dependent]:
    query = select(Dependent).order_by(Dependent.created_at)
    if household_id:
        query = query.where(Dependent.household_id == household_id)
    result = await session.exec(query)
    return result.all()


@router.get("/{dependent_id}", response_model=DependentResponse)
async def get_dependent(
    dependent_id: str,
    session: AsyncSession = Depends(get_session),
) -> Dependent:
    dep = await session.get(Dependent, dependent_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")
    return dep


@router.patch("/{dependent_id}", response_model=DependentResponse)
async def update_dependent(
    dependent_id: str,
    body: DependentUpdate,
    session: AsyncSession = Depends(get_session),
) -> Dependent:
    dep = await session.get(Dependent, dependent_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dep, field, value)
    dep.updated_at = datetime.utcnow()
    session.add(dep)
    await session.flush()
    await session.refresh(dep)
    return dep


@router.delete("/{dependent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dependent(
    dependent_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    dep = await session.get(Dependent, dependent_id)
    if not dep:
        raise HTTPException(status_code=404, detail="Dependent not found")
    await session.delete(dep)
