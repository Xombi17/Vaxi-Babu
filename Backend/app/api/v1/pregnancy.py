from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.dependent import Dependent, DependentType
from app.models.pregnancy import PregnancyProfile
from app.schemas.pregnancy import (
    PregnancyProfileCreate,
    PregnancyProfileResponse,
    PregnancyProfileUpdate,
)
from app.services.health_schedule.engine import generate_pregnancy_schedule

router = APIRouter(prefix="/pregnancy", tags=["Pregnancy"])


@router.post("", response_model=PregnancyProfileResponse)
async def create_pregnancy_profile(
    body: PregnancyProfileCreate,
    session: AsyncSession = Depends(get_session),
) -> PregnancyProfileResponse:
    """Create a pregnancy profile from LMP date and generate prenatal schedule."""
    # Check if household already has an active pregnancy
    stmt = select(PregnancyProfile).where(
        PregnancyProfile.household_id == body.household_id,
        PregnancyProfile.completed.is_(False),
    )
    result = await session.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Household already has an active pregnancy profile",
        )

    # Calculate expected due date (LMP + 280 days)
    expected_due_date = body.lmp_date + timedelta(days=280)

    profile = PregnancyProfile(
        household_id=body.household_id,
        lmp_date=body.lmp_date,
        expected_due_date=expected_due_date,
    )

    session.add(profile)
    await session.flush()

    # Find or create pregnant dependent for this household
    dep_stmt = select(Dependent).where(
        Dependent.household_id == body.household_id,
        Dependent.type == DependentType.pregnant,
    )
    dep_result = await session.execute(dep_stmt)
    dependent = dep_result.scalar_one_or_none()

    if dependent:
        # Generate pregnancy schedule for existing pregnant dependent
        await generate_pregnancy_schedule(dependent, body.lmp_date, session)

    await session.commit()
    await session.refresh(profile)

    return PregnancyProfileResponse.from_model(profile)


@router.get("/{household_id}", response_model=PregnancyProfileResponse)
async def get_pregnancy_profile(
    household_id: str,
    session: AsyncSession = Depends(get_session),
) -> PregnancyProfileResponse:
    """Get active pregnancy profile for a household."""
    stmt = select(PregnancyProfile).where(
        PregnancyProfile.household_id == household_id,
        PregnancyProfile.completed.is_(False),
    )
    result = await session.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="No active pregnancy profile found")

    return PregnancyProfileResponse.from_model(profile)


@router.patch("/{household_id}", response_model=PregnancyProfileResponse)
async def update_pregnancy_profile(
    household_id: str,
    body: PregnancyProfileUpdate,
    session: AsyncSession = Depends(get_session),
) -> PregnancyProfileResponse:
    """Update pregnancy profile (mark completed, add risk flags)."""
    stmt = select(PregnancyProfile).where(
        PregnancyProfile.household_id == household_id,
        PregnancyProfile.completed.is_(False),
    )
    result = await session.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="No active pregnancy profile found")

    if body.high_risk_flags is not None:
        profile.high_risk_flags = body.high_risk_flags
    if body.completed is not None:
        profile.completed = body.completed

    profile.updated_at = datetime.now(timezone.utc)
    session.add(profile)
    await session.commit()
    await session.refresh(profile)

    return PregnancyProfileResponse.from_model(profile)
