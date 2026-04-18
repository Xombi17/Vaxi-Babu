"""
Simple seed script using direct SQL and Supabase REST API
No pyiceberg dependency needed
"""
import asyncio
import os
import httpx
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlmodel import select

# Import models
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app.core.auth import get_password_hash
from app.models.household import Household
from app.models.dependent import Dependent
from app.models.health_event import HealthEvent, EventStatus

# Supabase setup
SUPABASE_URL = "https://azvvmmekxfcuzdadxlub.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_SERVICE_KEY:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY not set")
    print("Get it from: https://supabase.com/dashboard/project/azvvmmekxfcuzdadxlub/settings/api")
    exit(1)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/postgres")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Use a default password from env or a generic one for seeding
SEED_PASSWORD = os.getenv("SEED_DEMO_PASSWORD", "Vaxi Babu_demo_secure_2026")

DEMO_FAMILIES = [
    {"username": "sharma", "name": "Sharma Family", "email": "sharma@Vaxi Babu.demo", "password": SEED_PASSWORD},
    {"username": "patel", "name": "Patel Family", "email": "patel@Vaxi Babu.demo", "password": SEED_PASSWORD},
    {"username": "kumar", "name": "Kumar Family", "email": "kumar@Vaxi Babu.demo", "password": SEED_PASSWORD},
    {"username": "singh", "name": "Singh Family", "email": "singh@Vaxi Babu.demo", "password": SEED_PASSWORD},
    {"username": "verma", "name": "Verma Family", "email": "verma@Vaxi Babu.demo", "password": SEED_PASSWORD},
]

async def clear_data():
    """Delete all existing data from all tables"""
    print("\n🗑️  Clearing all existing database data...")
    tables = [
        "reminders", "health_events", "growth_records", "medicine_regimens", 
        "pregnancy_profiles", "conversations", "health_notes", "dependents", "households"
    ]
    async with AsyncSessionLocal() as session:
        for table in tables:
            try:
                await session.execute(text(f"DELETE FROM {table}"))
                print(f"   Cleared table: {table}")
            except Exception as e:
                print(f"   Warning: Could not clear {table} (it might not exist yet): {e}")
        await session.commit()
    print("✅ Database cleared")

async def delete_auth_users():
    """Delete ALL auth users via Supabase Admin API"""
    print("\n🗑️  Deleting all Supabase Auth users...")
    async with httpx.AsyncClient() as client:
        # List users
        response = await client.get(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            },
        )
        if response.status_code != 200:
            print(f"   Error fetching users: {response.text}")
            return
            
        users = response.json().get("users", [])
        print(f"   Found {len(users)} users to delete.")

        # Delete users
        for user in users:
            try:
                del_resp = await client.delete(
                    f"{SUPABASE_URL}/auth/v1/admin/users/{user['id']}",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    },
                )
                if del_resp.status_code in (200, 204):
                    print(f"   Deleted: {user['email']}")
                else:
                    print(f"   Failed to delete {user['email']}: {del_resp.text}")
            except Exception as e:
                print(f"   Error deleting user {user['id']}: {e}")
    print("✅ All auth users deleted")

async def create_demo_users():
    """Create Supabase Auth users and households"""
    print("\n👥 Creating demo users...")
    households = []

    async with httpx.AsyncClient() as client:
        for family in DEMO_FAMILIES:
            # Create auth user
            response = await client.post(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "email": family["email"],
                    "password": family["password"],
                    "email_confirm": True,
                },
            )

            if response.status_code != 200:
                print(f"   Error creating {family['email']}: {response.text}")
                continue

            user_data = response.json()
            user_id = user_data["id"]
            print(f"   Created auth user: {family['email']}")

            # Create household
            async with AsyncSessionLocal() as session:
                # Check if the trigger already created the household
                stmt = select(Household).where(Household.auth_id == user_id)
                db_result = await session.execute(stmt)
                existing_household = db_result.scalar_one_or_none()

                if existing_household:
                    print(f"   Trigger already created household for {family['email']}. Updating...")
                    existing_household.name = family["name"]
                    existing_household.username = family["username"]
                    existing_household.password_hash = get_password_hash(family["password"])
                    existing_household.primary_language = "hi"
                    household = existing_household
                else:
                    household = Household(
                        name=family["name"],
                        username=family["username"],
                        password_hash=get_password_hash(family["password"]),
                        primary_language="hi",
                        auth_id=user_id,
                    )
                    session.add(household)
                
                await session.commit()
                await session.refresh(household)
                households.append(household)
                print(f"   Synced household: {family['name']}")

    print(f"✅ Created {len(households)} households")
    return households

async def seed_dependents(households):
    """Seed dependents"""
    print("\n👶 Seeding dependents...")
    dependents = []

    for household in households:
        async with AsyncSessionLocal() as session:
            child = Dependent(
                household_id=household.id,
                name=f"{household.name.split()[0]} Child",
                type="child",
                date_of_birth=date.today() - timedelta(days=270),  # 9 months
                sex="male",
            )
            session.add(child)
            await session.commit()
            await session.refresh(child)
            dependents.append(child)
            print(f"   Added: {child.name}")

    print(f"✅ Seeded {len(dependents)} dependents")
    return dependents

async def seed_health_events(dependents):
    """Seed health events"""
    print("\n💉 Seeding health events...")
    count = 0

    for dependent in dependents:
        async with AsyncSessionLocal() as session:
            events = [
                HealthEvent(
                    dependent_id=dependent.id,
                    household_id=dependent.household_id,
                    name="BCG",
                    schedule_key="bcg_birth",
                    category="vaccination",
                    dose_number=1,
                    due_date=dependent.date_of_birth,
                    status=EventStatus.overdue,
                    schedule_version="1.0",
                ),
                HealthEvent(
                    dependent_id=dependent.id,
                    household_id=dependent.household_id,
                    name="Polio 0",
                    schedule_key="polio_0",
                    category="vaccination",
                    dose_number=0,
                    due_date=dependent.date_of_birth,
                    status=EventStatus.overdue,
                    schedule_version="1.0",
                ),
                HealthEvent(
                    dependent_id=dependent.id,
                    household_id=dependent.household_id,
                    name="DPT 1",
                    schedule_key="dpt_1",
                    category="vaccination",
                    dose_number=1,
                    due_date=dependent.date_of_birth + timedelta(weeks=6),
                    status=EventStatus.due,
                    schedule_version="1.0",
                ),
            ]
            for event in events:
                session.add(event)
                count += 1
            await session.commit()

    print(f"✅ Seeded {count} health events")

async def main():
    print("🚀 Starting Supabase seed...")

    await clear_data()
    await delete_auth_users()
    households = await create_demo_users()
    dependents = await seed_dependents(households)
    await seed_health_events(dependents)

    print("\n✅ Seed complete!")
    print(f"\n🔑 Demo credentials:")
    for family in DEMO_FAMILIES:
        print(f"   {family['email']} / {family['password']}")

if __name__ == "__main__":
    asyncio.run(main())
