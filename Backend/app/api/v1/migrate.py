"""
Migration endpoint for creating database tables
"""
import structlog
import subprocess
from fastapi import APIRouter, HTTPException
from app.core.database import create_db_and_tables

log = structlog.get_logger()
router = APIRouter(tags=["Migrations"])

@router.post("/migrate")
async def run_migrations():
    """
    Run Alembic migrations to update database schema.
    Use this instead of Shell when Shell access is not available.
    """
    try:
        # First create tables if they don't exist
        await create_db_and_tables()
        log.info("tables_created", message="Base tables created/verified")

        # Then run Alembic migrations to add new columns
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            cwd="/opt/render/project/src/Backend",
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            log.error("alembic_migration_failed", stderr=result.stderr)
            raise HTTPException(status_code=500, detail=f"Migration failed: {result.stderr}")

        log.info("migration_success", message="Database migrations completed", stdout=result.stdout)
        return {
            "status": "success",
            "message": "Database migrations completed successfully",
            "output": result.stdout
        }
    except subprocess.CalledProcessError as e:
        log.error("migration_subprocess_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Migration subprocess failed: {str(e)}")
    except Exception as e:
        log.error("migration_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
