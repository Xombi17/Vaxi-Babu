"""
Vaxi Babu — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import get_settings
from app.core.database import create_db_and_tables
from app.core.health import check_startup_health

log = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    log.info("Vaxi Babu_starting",
             env=settings.app_env,
             port=settings.app_port,
             allowed_origins=settings.frontend_url.split(","))

    # Validate environment
    health = check_startup_health()
    if not health.get("healthy"):
        log.error("startup_health_check_failed", health=health)
        log.warning("Continuing startup despite health check failures.")

    yield

    log.info("Vaxi Babu_shutting_down")


app = FastAPI(
    title="Vaxi Babu — Backend API",
    description=(
        "Voice-first health memory system API. "
        "Provides vaccination timelines, medicine safety checks, "
        "AI-powered health explanations, and Gemini Live voice support."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
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


@app.get("/", tags=["Root"])
async def root():
    return {
        "app": "Vaxi Babu — Backend API",
        "status": "online",
        "version": "0.1.0"
    }


@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "version": "0.1.0", "env": settings.app_env}
