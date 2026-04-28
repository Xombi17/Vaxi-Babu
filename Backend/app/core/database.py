from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text
from sqlmodel import SQLModel

from app.core.config import get_settings

settings = get_settings()

url = settings.database_url
if url and "sslmode" in url:
    url = url.replace("?sslmode=require", "").rstrip("?").rstrip("&")

engine_kwargs = {
    "echo": settings.is_dev,
}

engine = None
AsyncSessionLocal = None

if url:
    if url.startswith("sqlite"):
        pass
    else:
        engine_kwargs.update({
            "pool_pre_ping": True,
            "pool_size": 5,
            "max_overflow": 10,
            "connect_args": {
                "ssl": "require",
                "command_timeout": 60,
                "statement_cache_size": 0,
            }
        })

    engine = create_async_engine(url, **engine_kwargs)
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def create_db_and_tables() -> None:
    """Create all tables (called at app startup in dev). Use Alembic for production migrations."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

        # Ensure datetime columns are using TIMESTAMPTZ to handle aware datetimes
        # Split into individual commands to avoid asyncpg 'multiple commands' error
        migration_commands = [
            "ALTER TABLE households ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
            "ALTER TABLE households ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
            "ALTER TABLE households ALTER COLUMN last_onboarded_at TYPE TIMESTAMPTZ USING last_onboarded_at AT TIME ZONE 'UTC'",
            
            "ALTER TABLE health_events ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
            "ALTER TABLE health_events ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
            "ALTER TABLE health_events ALTER COLUMN due_date TYPE TIMESTAMPTZ USING due_date AT TIME ZONE 'UTC'",
            "ALTER TABLE health_events ALTER COLUMN completed_at TYPE TIMESTAMPTZ USING completed_at AT TIME ZONE 'UTC'",

            "ALTER TABLE dependents ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
            "ALTER TABLE dependents ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",

            "ALTER TABLE reminders ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
            "ALTER TABLE reminders ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
            
            "ALTER TABLE pregnancy_profiles ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
            "ALTER TABLE pregnancy_profiles ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
            
            "ALTER TABLE medicine_regimens ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
            "ALTER TABLE medicine_regimens ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC'",
            
            "ALTER TABLE conversations ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",
            "ALTER TABLE health_notes ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC'",

            "ALTER TABLE health_events ADD COLUMN IF NOT EXISTS verification_status VARCHAR",
            "ALTER TABLE health_events ADD COLUMN IF NOT EXISTS verified_by VARCHAR",
            "ALTER TABLE health_events ADD COLUMN IF NOT EXISTS verification_document_url VARCHAR",
            "ALTER TABLE health_events ADD COLUMN IF NOT EXISTS verification_notes TEXT",
            "ALTER TABLE health_events ADD COLUMN IF NOT EXISTS marked_given_at TIMESTAMPTZ"
        ]

        for cmd in migration_commands:
            try:
                await conn.execute(text(cmd))
            except Exception as e:
                # Log and continue if a specific migration fails (e.g. table doesn't exist yet)
                print(f"Migration command failed: {cmd}. Error: {e}")


async def drop_db_and_tables() -> None:
    """Drop all tables (used for fresh development resets)."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
