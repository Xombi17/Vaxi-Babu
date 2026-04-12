"""
Migration endpoint for creating database tables
"""
import structlog
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.database import get_session, create_db_and_tables

log = structlog.get_logger()
router = APIRouter(tags=["Migrations"])

@router.post("/migrate")
async def run_migrations(session: AsyncSession = Depends(get_session)):
    """
    Run database migrations to update schema.
    Use this instead of Shell when Shell access is not available.
    """
    try:
        # First create tables if they don't exist
        await create_db_and_tables()
        log.info("tables_created", message="Base tables created/verified")

        # Add missing columns to health_events table
        await session.execute(text("""
            ALTER TABLE health_events
            ADD COLUMN IF NOT EXISTS verification_status VARCHAR,
            ADD COLUMN IF NOT EXISTS verified_by VARCHAR,
            ADD COLUMN IF NOT EXISTS verification_document_url VARCHAR,
            ADD COLUMN IF NOT EXISTS verification_notes TEXT,
            ADD COLUMN IF NOT EXISTS marked_given_at TIMESTAMP;
        """))
        await session.commit()

        log.info("migration_success", message="Database migrations completed")
        return {
            "status": "success",
            "message": "Database migrations completed successfully"
        }
    except Exception as e:
        log.error("migration_failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
