import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context
from sqlmodel import SQLModel

from app.core.config import get_settings
from app.models.household import Household
from app.models.dependent import Dependent
from app.models.health_event import HealthEvent
from app.models.reminder import Reminder

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()
url = settings.database_url
async_url = url.replace("postgresql+asyncpg://", "postgresql+asyncpg://")
if "sslmode" in async_url:
    async_url = async_url.replace("?sslmode=require", "").rstrip("?").rstrip("&")

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    engine = create_async_engine(
        async_url,
        echo=True,
        poolclass=pool.NullPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio

    asyncio.run(run_async_migrations())
