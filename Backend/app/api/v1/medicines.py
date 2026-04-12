from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.medicine_regimen import MedicineRegimen
from app.schemas.medicine_regimen import (
    MedicineRegimenCreate,
    MedicineRegimenResponse,
    MedicineRegimenUpdate,
)
from app.services.health_schedule.engine import generate_medicine_events

router = APIRouter(prefix="/medicines", tags=["Medicine Regimens"])


@router.post("", response_model=MedicineRegimenResponse)
async def create_medicine_regimen(
    body: MedicineRegimenCreate,
    session: AsyncSession = Depends(get_session),
) -> MedicineRegimen:
    """Create a medicine regimen for a dependent and generate dose events."""
    regimen = MedicineRegimen(
        dependent_id=body.dependent_id,
        household_id=body.household_id,
        medicine_name=body.medicine_name,
        dosage=body.dosage,
        frequency=body.frequency,
        start_date=body.start_date,
        end_date=body.end_date,
        safety_bucket=body.safety_bucket,
        prescribing_note=body.prescribing_note,
    )

    session.add(regimen)
    await session.flush()

    # Generate medicine dose events (30-day rolling window)
    await generate_medicine_events(regimen, session)

    await session.commit()
    await session.refresh(regimen)

    return regimen


@router.get("/{dependent_id}", response_model=list[MedicineRegimenResponse])
async def list_medicine_regimens(
    dependent_id: str,
    session: AsyncSession = Depends(get_session),
) -> list[MedicineRegimen]:
    """List active medicine regimens for a dependent."""
    stmt = select(MedicineRegimen).where(
        MedicineRegimen.dependent_id == dependent_id,
        MedicineRegimen.active == True,
    )
    result = await session.execute(stmt)
    regimens = result.scalars().all()

    return list(regimens)


@router.patch("/{regimen_id}", response_model=MedicineRegimenResponse)
async def update_medicine_regimen(
    regimen_id: str,
    body: MedicineRegimenUpdate,
    session: AsyncSession = Depends(get_session),
) -> MedicineRegimen:
    """Update a medicine regimen."""
    regimen = await session.get(MedicineRegimen, regimen_id)
    if not regimen:
        raise HTTPException(status_code=404, detail="Medicine regimen not found")

    if body.dosage is not None:
        regimen.dosage = body.dosage
    if body.frequency is not None:
        regimen.frequency = body.frequency
    if body.end_date is not None:
        regimen.end_date = body.end_date
    if body.prescribing_note is not None:
        regimen.prescribing_note = body.prescribing_note
    if body.active is not None:
        regimen.active = body.active

    regimen.updated_at = datetime.utcnow()
    session.add(regimen)
    await session.commit()
    await session.refresh(regimen)

    return regimen


@router.delete("/{regimen_id}", response_model=MedicineRegimenResponse)
async def deactivate_medicine_regimen(
    regimen_id: str,
    session: AsyncSession = Depends(get_session),
) -> MedicineRegimen:
    """Deactivate a medicine regimen."""
    regimen = await session.get(MedicineRegimen, regimen_id)
    if not regimen:
        raise HTTPException(status_code=404, detail="Medicine regimen not found")

    regimen.active = False
    regimen.updated_at = datetime.utcnow()
    session.add(regimen)
    await session.commit()
    await session.refresh(regimen)

    return regimen
