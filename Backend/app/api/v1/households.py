from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.household import Household
from app.schemas.household import HouseholdCreate, HouseholdResponse, HouseholdUpdate

router = APIRouter(prefix="/households", tags=["Households"])


@router.post("", response_model=HouseholdResponse, status_code=status.HTTP_201_CREATED)
async def create_household(
    body: HouseholdCreate,
    session: AsyncSession = Depends(get_session),
) -> Household:
    household = Household(**body.model_dump())
    session.add(household)
    await session.flush()
    await session.refresh(household)
    return household


@router.get("", response_model=list[HouseholdResponse])
async def list_households(
    session: AsyncSession = Depends(get_session),
) -> list[Household]:
    result = await session.execute(select(Household).order_by(Household.created_at.desc()))
    return result.scalars().all()


@router.get("/{household_id}", response_model=HouseholdResponse)
async def get_household(
    household_id: str,
    session: AsyncSession = Depends(get_session),
) -> Household:
    household = await session.get(Household, household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    return household


@router.patch("/{household_id}", response_model=HouseholdResponse)
async def update_household(
    household_id: str,
    body: HouseholdUpdate,
    session: AsyncSession = Depends(get_session),
) -> Household:
    household = await session.get(Household, household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(household, field, value)
    household.updated_at = datetime.utcnow()
    session.add(household)
    await session.flush()
    await session.refresh(household)
    return household


@router.delete("/{household_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_household(
    household_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    household = await session.get(Household, household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    await session.delete(household)


@router.get("/asha/assigned", response_model=list[HouseholdResponse])
async def list_assigned_households(
    user_type: str = "asha",
    session: AsyncSession = Depends(get_session),
) -> list[Household]:
    """List households assigned to an ASHA/Anganwadi worker."""
    from app.models.household import UserType

    user_type_enum = UserType.from_string(user_type) if isinstance(user_type, str) else user_type

    result = await session.execute(
        select(Household).where(Household.user_type == user_type_enum).order_by(Household.created_at.desc())
    )
    return result.scalars().all()
