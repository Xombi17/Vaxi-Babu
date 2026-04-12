import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate():
    async with engine.begin() as conn:
        print("Adding 'preferences' and 'last_onboarded_at' columns to households...")
        await conn.execute(text("ALTER TABLE households ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'"))
        await conn.execute(text("ALTER TABLE households ADD COLUMN IF NOT EXISTS last_onboarded_at TIMESTAMP WITHOUT TIME ZONE"))
        print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
