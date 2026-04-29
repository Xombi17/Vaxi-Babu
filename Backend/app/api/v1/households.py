from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.conversation import Conversation, HealthNote
from app.models.dependent import Dependent
from app.models.growth_record import GrowthRecord
from app.models.health_event import HealthEvent
from app.models.medicine_regimen import MedicineRegimen
from app.models.pregnancy import PregnancyProfile
from app.models.reminder import Reminder
from app.models.household import Household
from app.schemas.household import HouseholdCreate, HouseholdResponse, HouseholdUpdate
from app.services.scheme_service import get_eligible_schemes, HealthScheme
from app.core.auth import get_current_household, get_password_hash

router = APIRouter(prefix="/households", tags=["Households"])


def _normalize_username(username: str) -> str:
    normalized = username.strip()
    if "@" in normalized:
        normalized = normalized.lower()
    return normalized


@router.post("", response_model=HouseholdResponse, status_code=status.HTTP_201_CREATED)
async def create_household(
    body: HouseholdCreate,
    session: AsyncSession = Depends(get_session),
) -> Household:
    """Create a new household with username and password.

    Args:
        body: HouseholdCreate schema with household details
        session: Database session

    Returns:
        Created household as HouseholdResponse

    Raises:
        HTTPException: If username already exists or validation fails
    """
    username = _normalize_username(body.username)
    password = body.password

    # Validate username and password are provided
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    # Check for duplicate username
    result = await session.execute(select(Household).where(Household.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")

    # Prepare household data
    body_data = body.model_dump(exclude={"password"})  # Exclude password from dict
    body_data["username"] = username
    body_data["password_hash"] = get_password_hash(password)

    # Create and persist household
    household = Household(**body_data)
    session.add(household)
    await session.flush()
    await session.refresh(household)
    return household


@router.get("", response_model=list[HouseholdResponse])
async def list_households(
    current_household: Household = Depends(get_current_household),
) -> list[Household]:
    return [current_household]


@router.get("/{household_id}", response_model=HouseholdResponse)
async def get_household(
    household_id: str,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> Household:
    if current_household.id != household_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    household = await session.get(Household, household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    return household


@router.patch("/{household_id}", response_model=HouseholdResponse)
async def update_household(
    household_id: str,
    body: HouseholdUpdate,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> Household:
    if current_household.id != household_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    household = await session.get(Household, household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")

    update_data = body.model_dump(exclude_unset=True)

    # Validate that immutable fields are not being updated
    if "username" in update_data:
        raise HTTPException(status_code=400, detail="Username cannot be updated")
    if "password" in update_data:
        raise HTTPException(status_code=400, detail="Password cannot be updated")

    for field, value in update_data.items():
        setattr(household, field, value)
    
    household.updated_at = datetime.now(timezone.utc)
    
    # Use merge to handle instances that might be detached or from auth layer
    await session.merge(household)
    await session.flush()
    return household


@router.delete("/{household_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_household(
    household_id: str,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> None:
    if current_household.id != household_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    household = await session.get(Household, household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")

    # Remove dependent records first so foreign key constraints do not block deletion.
    await session.execute(delete(Reminder).where(Reminder.household_id == household_id))
    await session.execute(delete(HealthEvent).where(HealthEvent.household_id == household_id))
    await session.execute(delete(GrowthRecord).where(GrowthRecord.household_id == household_id))
    await session.execute(delete(MedicineRegimen).where(MedicineRegimen.household_id == household_id))
    await session.execute(delete(PregnancyProfile).where(PregnancyProfile.household_id == household_id))
    await session.execute(delete(Conversation).where(Conversation.household_id == household_id))
    await session.execute(delete(HealthNote).where(HealthNote.household_id == household_id))
    await session.execute(delete(Dependent).where(Dependent.household_id == household_id))

    await session.delete(household)
    await session.commit()


@router.get("/asha/assigned", response_model=list[HouseholdResponse])
async def list_assigned_households(
    user_type: str = "asha",
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> list[Household]:
    """List households assigned to an ASHA/Anganwadi worker. Caller must be authenticated."""
    from app.models.household import UserType

    user_type_enum = UserType.from_string(user_type) if isinstance(user_type, str) else user_type

    # Only ASHA/Anganwadi users may call this endpoint
    if current_household.user_type not in (UserType.from_string("asha"), UserType.from_string("anganwadi")):
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await session.execute(
        select(Household).where(Household.user_type == user_type_enum).order_by(Household.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{household_id}/schemes", response_model=list[HealthScheme])
async def list_household_schemes(
    household_id: str,
    session: AsyncSession = Depends(get_session),
    current_household: Household = Depends(get_current_household),
) -> list[HealthScheme]:
    """Get government health schemes eligible for this household."""
    if current_household.id != household_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    household = await session.get(Household, household_id)
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")

    return await get_eligible_schemes(household, session)
