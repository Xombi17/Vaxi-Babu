import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'households'"))
        columns = [r[0] for r in res.fetchall()]
        print(f"Columns in households: {columns}")

if __name__ == "__main__":
    asyncio.run(check())
