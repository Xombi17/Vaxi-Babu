from fastapi import APIRouter

from . import ai
from . import auth
from . import chw
from . import config
from . import dependents
from . import growth
from . import health_tips
from . import households
from . import medicine
from . import medicines
from . import migrate
from . import notifications
from . import pregnancy
from . import reminders
from . import sync
from . import timeline
from . import voice

router = APIRouter(prefix="/api/v1")

auth_router = APIRouter()
auth_router.include_router(auth.router)
router.include_router(auth_router)

router.include_router(households.router)
router.include_router(dependents.router)
router.include_router(timeline.router)
router.include_router(reminders.router)
router.include_router(medicine.router)
router.include_router(pregnancy.router)
router.include_router(medicines.router)
router.include_router(growth.router)
router.include_router(ai.router)
router.include_router(voice.router)
router.include_router(chw.router)
router.include_router(config.router)
router.include_router(sync.router)
router.include_router(health_tips.router)
router.include_router(notifications.router)
router.include_router(migrate.router)
