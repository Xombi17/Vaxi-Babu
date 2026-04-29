"""
Vaxi Babu — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Disable uvloop in production if present to avoid Errno 99 on Vercel
import os
if os.environ.get("VERCEL") == "1":
    try:
        import uvloop
        # We can't easily uninstall it at runtime, but we can try to prevent 
        # uvicorn from using it if we were starting it manually.
        # Since Vercel starts it, we'll log it and hope the connection pool fix handles it.
        # However, we can also try to force standard asyncio loop if possible.
        import asyncio
        asyncio.set_event_loop_policy(asyncio.DefaultEventLoopPolicy())
    except ImportError:
        pass

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

    # Database initialization and migration
    if settings.is_dev:
        log.info("initializing_database_dev")
        await create_db_and_tables()
    else:
        log.info("testing_database_connection_prod")
        from app.core.database import test_db_connection
        connected = await test_db_connection()
        if connected:
            log.info("database_connection_ok")
        else:
            log.error("database_connection_failed")

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
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_msg = str(exc)
    stack_trace = traceback.format_exc()
    
    log.error("unhandled_exception", path=request.url.path, error=error_msg, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error": error_msg if settings.is_dev else "An unexpected error occurred.",
            "stack": stack_trace if settings.is_dev else None
        },
        headers={
            "Access-Control-Allow-Origin": request.headers.get("Origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        }
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
