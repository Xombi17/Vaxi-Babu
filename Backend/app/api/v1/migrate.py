"""
Migration endpoint for creating database tables
"""
import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.database import get_session, create_db_and_tables

log = structlog.get_logger()
router = APIRouter(tags=["Migrations"])

@router.post("/migrate")
async def run_migrations():
    """
    Create all database tables. Safe to run multiple times.
    Use this instead of alembic when Shell access is not available.
    """
    try:
        await create_db_and_tables()
        log.info("migration_success", message="Database tables created/verified")
        return {
            "status": "success",
            "message": "Database tables created successfully"
        }
    except Exception as e:
        log.error("migration_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
