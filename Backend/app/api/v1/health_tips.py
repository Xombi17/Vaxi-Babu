from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.dependent import Dependent
from app.services.health_tips import get_tips_for_age

router = APIRouter(prefix="/health-tips", tags=["Health Tips"])


@router.get("")
async def get_health_tips(
    dependent_id: str = Query(..., description="ID of the child"),
    language: str = Query("en", description="Language code: en, hi, mr"),
    session: AsyncSession = Depends(get_session),
):
    """Get age-appropriate health tips for a dependent."""
    dependent = await session.get(Dependent, dependent_id)
    if not dependent:
        return {"tips": [], "error": "Dependent not found"}

    today = date.today()
    age_days = (today - dependent.date_of_birth).days
    age_months = age_days // 30

    tips = get_tips_for_age(age_months, language)

    return {
        "dependent_id": dependent_id,
        "age_months": age_months,
        "language": language,
        "tips": tips,
    }


@router.get("/by-age")
async def get_tips_by_age(
    age_months: int = Query(..., ge=0, le=216, description="Age in months"),
    language: str = Query("en", description="Language code: en, hi, mr"),
):
    """Get health tips for a specific age (without dependent lookup)."""
    tips = get_tips_for_age(age_months, language)
    return {
        "age_months": age_months,
        "language": language,
        "tips": tips,
    }
