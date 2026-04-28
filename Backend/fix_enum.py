import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:Oxamm7eE3RoubzZ1@db.azvvmmekxfcuzdadxlub.supabase.co:5432/postgres')
    
    # We use IF NOT EXISTS for ADD VALUE in postgres 12+
    try:
        await conn.execute("ALTER TYPE eventcategory ADD VALUE IF NOT EXISTS 'prenatal_checkup';")
        print("Added prenatal_checkup")
    except Exception as e:
        print(f"Error adding prenatal_checkup: {e}")
        
    try:
        await conn.execute("ALTER TYPE eventcategory ADD VALUE IF NOT EXISTS 'medicine_dose';")
        print("Added medicine_dose")
    except Exception as e:
        print(f"Error adding medicine_dose: {e}")
        
    try:
        await conn.execute("ALTER TYPE eventcategory ADD VALUE IF NOT EXISTS 'growth_check';")
        print("Added growth_check")
    except Exception as e:
        print(f"Error adding growth_check: {e}")
        
    try:
        await conn.execute("ALTER TYPE eventcategory ADD VALUE IF NOT EXISTS 'supplement';")
        print("Added supplement")
    except Exception as e:
        print(f"Error adding supplement: {e}")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
