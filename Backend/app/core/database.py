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
            "pool_size": 1,
            "max_overflow": 0,
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

        # Add missing columns to health_events table (safe to run multiple times)
        await conn.execute(text("""
            ALTER TABLE health_events
            ADD COLUMN IF NOT EXISTS verification_status VARCHAR,
            ADD COLUMN IF NOT EXISTS verified_by VARCHAR,
            ADD COLUMN IF NOT EXISTS verification_document_url VARCHAR,
            ADD COLUMN IF NOT EXISTS verification_notes TEXT,
            ADD COLUMN IF NOT EXISTS marked_given_at TIMESTAMP;
        """))


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
