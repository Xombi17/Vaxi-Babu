import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os

async def test_db():
    db_url = "postgresql+asyncpg://neondb_owner:npg_ri5ZzM0focwT@ep-floral-rain-ajy4us6o-pooler.c-3.us-east-2.aws.neon.tech/neondb"
    print(f"Connecting to {db_url}...")
    engine = create_async_engine(db_url)
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
            print("Successfully connected to DB and executed SELECT 1")
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_db())
