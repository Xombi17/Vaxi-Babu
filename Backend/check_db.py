import asyncio
from app.core.database import engine
from sqlalchemy import text

async def main():
    try:
        async with engine.connect() as conn:
            households = (await conn.execute(text('SELECT id, name FROM household'))).fetchall()
            dependents = (await conn.execute(text('SELECT id, name, household_id FROM dependent'))).fetchall()
            
            print("\n--- Households ---")
            for h in households:
                print(f"ID: {h.id}, Name: {h.name}")
            
            print("\n--- Dependents ---")
            for d in dependents:
                print(f"ID: {d.id}, Name: {d.name}, Household: {d.household_id}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
