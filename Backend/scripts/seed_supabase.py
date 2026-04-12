"""
Seed Supabase with demo data
- Creates Supabase Auth users
- Links households to auth users
- Seeds dependents and health events
"""
import asyncio
import os
from datetime import date, timedelta
from supabase import create_client, Client
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlmodel import select

# Import models
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app.models.household import Household
from app.models.dependent import Dependent
from app.models.health_event import HealthEvent, EventStatus, VerificationStatus

# Supabase setup
SUPABASE_URL = "https://azvvmmekxfcuzdadxlub.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_SERVICE_KEY:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY not set")
    print("Get it from: https://supabase.com/dashboard/project/azvvmmekxfcuzdadxlub/settings/api")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/postgres")
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

SEED_PASSWORD = os.getenv("SEED_DEMO_PASSWORD", "wellsync_demo_secure_2026")

DEMO_FAMILIES = [
    {"username": "sharma", "name": "Sharma Family", "email": "sharma@wellsync.demo", "password": SEED_PASSWORD},
    {"username": "patel", "name": "Patel Family", "email": "patel@wellsync.demo", "password": SEED_PASSWORD},
    {"username": "kumar", "name": "Kumar Family", "email": "kumar@wellsync.demo", "password": SEED_PASSWORD},
    {"username": "singh", "name": "Singh Family", "email": "singh@wellsync.demo", "password": SEED_PASSWORD},
    {"username": "verma", "name": "Verma Family", "email": "verma@wellsync.demo", "password": SEED_PASSWORD},
]

async def clear_existing_data():
    """Delete all existing households, dependents, and health events"""
    print("\n🗑️  Clearing existing data...")
    async with AsyncSessionLocal() as session:
        await session.execute("DELETE FROM health_events")
        await session.execute("DELETE FROM dependents")
        await session.execute("DELETE FROM households")
        await session.commit()
    print("✅ Cleared existing data")

async def delete_auth_users():
    """Delete all demo auth users"""
    print("\n🗑️  Deleting existing auth users...")
    for family in DEMO_FAMILIES:
        try:
            # Get user by email
            response = supabase.auth.admin.list_users()
            users = response.users if hasattr(response, 'users') else []

            for user in users:
                if user.email == family["email"]:
                    supabase.auth.admin.delete_user(user.id)
                    print(f"   Deleted user: {family['email']}")
        except Exception as e:
            print(f"   Error deleting {family['email']}: {e}")
    print("✅ Deleted auth users")

async def create_demo_users():
    """Create Supabase Auth users and households"""
    print("\n👥 Creating demo users...")

    households = []

    for family in DEMO_FAMILIES:
        try:
            # Create Supabase Auth user
            auth_response = supabase.auth.admin.create_user({
                "email": family["email"],
                "password": family["password"],
                "email_confirm": True,
            })

            user_id = auth_response.user.id
            print(f"   Created auth user: {family['email']} (ID: {user_id})")

            # Create household linked to auth user
            async with AsyncSessionLocal() as session:
                household = Household(
                    name=family["name"],
                    username=family["username"],
                    primary_language="hi",
                    auth_user_id=user_id,
                )
                session.add(household)
                await session.commit()
                await session.refresh(household)
                households.append(household)
                print(f"   Created household: {family['name']} (ID: {household.id})")

        except Exception as e:
            print(f"   Error creating {family['name']}: {e}")

    print(f"✅ Created {len(households)} households")
    return households

async def seed_dependents(households):
    """Seed dependents for each household"""
    print("\n👶 Seeding dependents...")

    dependents = []

    for household in households:
        async with AsyncSessionLocal() as session:
            # Add 1-2 children per household
            child1 = Dependent(
                household_id=household.id,
                name=f"{household.name.split()[0]} Child",
                type="child",
                date_of_birth=date.today() - timedelta(days=270),  # 9 months old
                sex="male",
            )
            session.add(child1)
            dependents.append(child1)

            await session.commit()
            print(f"   Added dependent: {child1.name} to {household.name}")

    print(f"✅ Seeded {len(dependents)} dependents")
    return dependents

async def seed_health_events(dependents):
    """Seed health events for dependents"""
    print("\n💉 Seeding health events...")

    events_count = 0
    asha_workers = ["Priya", "Anjali", "Meera"]

    for dependent in dependents:
        async with AsyncSessionLocal() as session:
            # BCG - Birth (verified by ASHA)
            bcg = HealthEvent(
                dependent_id=dependent.id,
                household_id=dependent.household_id,
                name="BCG",
                schedule_key="bcg_birth",
                category="vaccination",
                dose_number=1,
                due_date=dependent.date_of_birth,
                status=EventStatus.completed,
                completed_at=dependent.date_of_birth + timedelta(hours=2),
                completed_by="Dr. Sharma",
                location="District Hospital",
                verification_status=VerificationStatus.verified,
                verified_by=asha_workers[0],
                verification_notes="Verified at health camp on birth date",
                marked_given_at=dependent.date_of_birth + timedelta(hours=1),
                schedule_version="1.0",
            )
            session.add(bcg)

            # Polio 0 - Birth (verified by ASHA)
            polio0 = HealthEvent(
                dependent_id=dependent.id,
                household_id=dependent.household_id,
                name="Polio 0",
                schedule_key="polio_0",
                category="vaccination",
                dose_number=0,
                due_date=dependent.date_of_birth,
                status=EventStatus.completed,
                completed_at=dependent.date_of_birth + timedelta(hours=3),
                completed_by="Dr. Sharma",
                location="District Hospital",
                verification_status=VerificationStatus.verified,
                verified_by=asha_workers[1],
                verification_notes="Verified at health camp",
                marked_given_at=dependent.date_of_birth + timedelta(hours=2),
                schedule_version="1.0",
            )
            session.add(polio0)

            # DPT 1 - 6 weeks (pending verification)
            dpt1_date = dependent.date_of_birth + timedelta(weeks=6)
            dpt1 = HealthEvent(
                dependent_id=dependent.id,
                household_id=dependent.household_id,
                name="DPT 1",
                schedule_key="dpt_1",
                category="vaccination",
                dose_number=1,
                due_date=dpt1_date,
                status=EventStatus.completed if dpt1_date <= date.today() else EventStatus.upcoming,
                completed_at=dpt1_date if dpt1_date <= date.today() else None,
                completed_by="Dr. Patel" if dpt1_date <= date.today() else None,
                location="Primary Health Center" if dpt1_date <= date.today() else None,
                verification_status=VerificationStatus.pending if dpt1_date <= date.today() else VerificationStatus.pending,
                marked_given_at=dpt1_date if dpt1_date <= date.today() else None,
                schedule_version="1.0",
            )
            session.add(dpt1)

            # Hepatitis B - 6 weeks (verified by ASHA)
            hepb_date = dependent.date_of_birth + timedelta(weeks=6)
            hepb = HealthEvent(
                dependent_id=dependent.id,
                household_id=dependent.household_id,
                name="Hepatitis B",
                schedule_key="hepatitis_b_6w",
                category="vaccination",
                dose_number=1,
                due_date=hepb_date,
                status=EventStatus.completed if hepb_date <= date.today() else EventStatus.upcoming,
                completed_at=hepb_date if hepb_date <= date.today() else None,
                completed_by="Dr. Patel" if hepb_date <= date.today() else None,
                location="Primary Health Center" if hepb_date <= date.today() else None,
                verification_status=VerificationStatus.verified if hepb_date <= date.today() else VerificationStatus.pending,
                verified_by=asha_workers[2] if hepb_date <= date.today() else None,
                verification_notes="Verified at routine checkup" if hepb_date <= date.today() else None,
                marked_given_at=hepb_date if hepb_date <= date.today() else None,
                schedule_version="1.0",
            )
            session.add(hepb)

            events_count += 4
            await session.commit()

    print(f"✅ Seeded {events_count} health events with verification data")

async def main():
    print("🚀 Starting Supabase seed script...")

    # Step 1: Clear existing data
    await clear_existing_data()
    await delete_auth_users()

    # Step 2: Create demo users and households
    households = await create_demo_users()

    # Step 3: Seed dependents
    dependents = await seed_dependents(households)

    # Step 4: Seed health events
    await seed_health_events(dependents)

    print("\n✅ Seed complete!")
    print(f"\n📊 Summary:")
    print(f"   - {len(households)} households created")
    print(f"   - {len(dependents)} dependents created")
    print(f"   - Health events seeded")
    print(f"\n🔑 Demo credentials:")
    for family in DEMO_FAMILIES:
        print(f"   {family['email']} / {family['password']}")

if __name__ == "__main__":
    asyncio.run(main())
