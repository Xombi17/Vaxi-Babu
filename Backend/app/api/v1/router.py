from fastapi import APIRouter

from app.api.v1 import ai, dependents, households, medicine, reminders, sync, timeline, voice

router = APIRouter(prefix="/api/v1")

router.include_router(households.router)
router.include_router(dependents.router)
router.include_router(timeline.router)
router.include_router(reminders.router)
router.include_router(medicine.router)
router.include_router(ai.router)
router.include_router(voice.router)
router.include_router(sync.router)
