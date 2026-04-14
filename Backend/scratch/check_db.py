import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    url = os.getenv('DATABASE_URL').replace('+asyncpg', '')
    conn = await asyncpg.connect(url)
    rows = await conn.fetch('SELECT id, auth_id, username FROM households')
    for r in rows:
        print(f"ID: {r['id']} | AuthID: {r['auth_id']} | Username: {r['username']}")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(run())
