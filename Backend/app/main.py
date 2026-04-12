"""
WellSync AI — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import get_settings
from app.core.database import create_db_and_tables

log = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    log.info("wellsync_starting", 
             env=settings.app_env, 
             port=settings.app_port,
             allowed_origins=settings.frontend_url.split(","))

    # Auto-create tables in development (use Alembic for production)
    if settings.is_dev:
        await create_db_and_tables()
        log.info("db_tables_created_or_verified")

    yield

    log.info("wellsync_shutting_down")


app = FastAPI(
    title="WellSync AI — Backend API",
    description=(
        "Voice-first health memory system API. "
        "Provides vaccination timelines, medicine safety checks, "
        "AI-powered health explanations, and Vapi voice webhooks."
    ),
    version="0.1.0",
    docs_url="/docs" if settings.is_dev else None,     # Hide Swagger in prod
    redoc_url="/redoc" if settings.is_dev else None,
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Split comma-separated origins from settings
raw_origins = settings.frontend_url.split(",")
ALLOWED_ORIGINS = [origin.strip() for origin in raw_origins if origin.strip()]

# If in production and FRONTEND_URL is not set to allow all, we ensure Vercel is there
if settings.is_prod and "https://well-sync-nine.vercel.app" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("https://well-sync-nine.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if "*" not in ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(v1_router)


@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "version": "0.1.0", "env": settings.app_env}
