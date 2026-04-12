from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.growth_record import GrowthRecord
from app.schemas.growth import GrowthRecordCreate, GrowthRecordResponse

router = APIRouter(prefix="/growth", tags=["Growth Tracking"])


@router.post("/{dependent_id}", response_model=GrowthRecordResponse)
async def create_growth_record(
    dependent_id: str,
    body: GrowthRecordCreate,
    session: AsyncSession = Depends(get_session),
) -> GrowthRecord:
    """Record a growth measurement for a dependent."""
    # Validate at least one measurement is provided
    if (
        body.height_cm is None
        and body.weight_kg is None
        and body.head_circumference_cm is None
        and not body.milestone_achieved
    ):
        raise HTTPException(
            status_code=400,
            detail="At least one measurement or milestone must be provided",
        )

    if body.dependent_id != dependent_id:
        raise HTTPException(status_code=400, detail="Route dependent_id does not match payload dependent_id")

    record = GrowthRecord(
        dependent_id=dependent_id,
        household_id=body.household_id,
        recorded_date=body.recorded_date,
        height_cm=body.height_cm,
        weight_kg=body.weight_kg,
        head_circumference_cm=body.head_circumference_cm,
        milestone_achieved=body.milestone_achieved,
        notes=body.notes,
    )

    session.add(record)
    await session.commit()
    await session.refresh(record)

    return record


@router.get("/{dependent_id}", response_model=list[GrowthRecordResponse])
async def list_growth_records(
    dependent_id: str,
    session: AsyncSession = Depends(get_session),
) -> list[GrowthRecord]:
    """Get growth history for a dependent."""
    stmt = (
        select(GrowthRecord)
        .where(GrowthRecord.dependent_id == dependent_id)
        .order_by(GrowthRecord.recorded_date.desc())
    )
    result = await session.execute(stmt)
    records = result.scalars().all()

    return list(records)
