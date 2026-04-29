from collections.abc import AsyncGenerator
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.core.config import get_settings

settings = get_settings()


def _normalize_database_url(database_url: str | None) -> str | None:
    """Return a SQLAlchemy async URL that is compatible with Supabase poolers."""
    if not database_url:
        return None

    normalized = database_url.strip()

    if normalized.startswith("postgres://"):
        normalized = normalized.replace("postgres://", "postgresql://", 1)

    if normalized.startswith("postgresql://"):
        normalized = normalized.replace("postgresql://", "postgresql+asyncpg://", 1)

    if normalized.startswith("postgresql+asyncpg://"):
        parts = urlsplit(normalized)
        params = parse_qs(parts.query, keep_blank_values=True)

        # asyncpg does not accept libpq's sslmode query param. SQLAlchemy's
        # asyncpg dialect accepts this query param and avoids PgBouncer prepared
        # statement cache issues with Supabase transaction pooler connections.
        params.pop("sslmode", None)
        params.setdefault("prepared_statement_cache_size", ["0"])

        normalized = urlunsplit(
            (
                parts.scheme,
                parts.netloc,
                parts.path,
                urlencode(params, doseq=True),
                parts.fragment,
            )
        )

    return normalized


url = _normalize_database_url(settings.database_url)

engine_kwargs = {
    "echo": settings.is_dev,
}

engine = None
AsyncSessionLocal = None

if url:
    if not url.startswith("sqlite"):
        from sqlalchemy.pool import QueuePool
        # Use QueuePool for persistent FastAPI Cloud connections
        if not settings.is_dev:
            engine_kwargs["poolclass"] = QueuePool
            engine_kwargs["pool_size"] = 10
            engine_kwargs["max_overflow"] = 20
            engine_kwargs["pool_pre_ping"] = True

        # asyncpg accepts "ssl", but not a separate "server_hostname" kwarg.
        # Keep the original hostname in the URL so TLS/SNI works with Supabase.
        engine_kwargs["connect_args"] = {
            "ssl": "require",
            "command_timeout": 30,
            "statement_cache_size": 0,
            "server_settings": {
                "search_path": "public",
                "application_name": "vaxi-babu-api"
            }
        }

    engine = create_async_engine(url, **engine_kwargs)
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

async def test_db_connection():
    """Test the database connection and log status."""
    if engine is None:
        return False
    
    import asyncio
    max_retries = 3
    for attempt in range(max_retries):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                return True
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2
                print(f"DB connection attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
            else:
                print(f"DB connection failed after {max_retries} attempts: {e}")
                return False
    return False


async def create_db_and_tables() -> None:
    """Create all tables (called at app startup in dev). Use Alembic for production migrations."""
    if engine is None:
        print("Database engine not initialized. Skipping table creation.")
        return

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
