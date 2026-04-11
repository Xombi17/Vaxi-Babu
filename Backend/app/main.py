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
    log.info("wellsync_starting", env=settings.app_env)

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(v1_router)


@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "version": "0.1.0", "env": settings.app_env}
