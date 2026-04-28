import asyncio
import os
import uuid
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine, create_db_and_tables
from app.models.household import Household
from app.models.dependent import Dependent, DependentType, Sex
from app.models.health_event import EventStatus
from app.services.health_schedule.engine import generate_and_save_schedule
from app.core.auth import get_password_hash

async def seed_data():
    print("🌱 Starting fresh seeding process...")
    
    # Drop and recreate tables to ensure schema matches current models
    print("🧹 Resetting database schema...")
    # await drop_db_and_tables()
    await create_db_and_tables()

    async with AsyncSession(engine) as session:
        # Tables were just created, so they are empty.

        families = [
            {
                "username": "sharma",
                "name": "Sharma Family",
                "city": "Noids",
                "state": "Uttar Pradesh",
                "children": [
                    {"name": "Aarav", "age_days": 270, "sex": Sex.male}, # 9 months
                    {"name": "Ishaan", "age_days": 30, "sex": Sex.male},  # 1 month
                ]
            },
            {
                "username": "patel",
                "name": "Patel Family",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "children": [
                    {"name": "Ananya", "age_days": 1100, "sex": Sex.female}, # ~3 years
                ]
            },
            {
                "username": "kumar",
                "name": "Kumar Family",
                "city": "Patna",
                "state": "Bihar",
                "children": [
                    {"name": "Aditya", "age_days": 180, "sex": Sex.male}, # 6 months
                ]
            },
            {
                "username": "singh",
                "name": "Singh Family",
                "city": "Amritsar",
                "state": "Punjab",
                "children": [
                    {"name": "Gurpreet", "age_days": 730, "sex": Sex.female}, # 2 years
                ]
            },
            {
                "username": "verma",
                "name": "Verma Family",
                "city": "Indore",
                "state": "Madhya Pradesh",
                "children": [
                    {"name": "Saanvi", "age_days": 2190, "sex": Sex.female}, # 6 years
                ]
            }
        ]

        dev_password = os.environ.get("DEV_DEFAULT_PASSWORD", "Vaxi Babu_demo_secure_2026")
        password_hash = get_password_hash(dev_password)

        for f_data in families:
            household = Household(
                id=str(uuid.uuid4()),
                username=f_data["username"],
                password_hash=password_hash,
                name=f_data["name"],
                primary_language="en",
                village_town=f_data["city"],
                state=f_data["state"]
            )
            session.add(household)
            print(f"🏠 Created household: {household.name} (@{household.username})")
            await session.flush() # Get the ID for foreign keys

            for c_data in f_data["children"]:
                dob = date.today() - timedelta(days=c_data["age_days"])
                child = Dependent(
                    id=str(uuid.uuid4()),
                    household_id=household.id,
                    name=c_data["name"],
                    type=DependentType.child,
                    sex=c_data["sex"],
                    date_of_birth=dob
                )
                session.add(child)
                print(f"  👶 Created child: {child.name} (DOB: {dob})")
                await session.flush()
                
                # Generate health timeline for the child
                events = await generate_and_save_schedule(child, session)
                
                # Randomly mark some past events as completed/overdue for realism
                for event in events:
                    if event.due_date < date.today():
                        # If more than 30 days overdue, mark as overdue, otherwise completed (randomly)
                        if (date.today() - event.due_date).days > 30:
                            event.status = EventStatus.overdue if c_data["name"] == "Aarav" else EventStatus.completed
                        else:
                            event.status = EventStatus.completed
                
                print(f"  📅 Generated {len(events)} health events for {child.name}")
            
            await session.commit()
            print(f"✅ Committed {f_data['name']} to database.")
    
    print("\n✅ Seeding complete!")
    if os.environ.get("DEV_SHOW_PASSWORD", "false").lower() in ("1", "true", "yes"):
        print(f"Try logging in with username 'sharma' and password '{dev_password}'")
    else:
        print("Try logging in with username 'sharma'. Set DEV_SHOW_PASSWORD=true to display the dev password.")

if __name__ == "__main__":
    asyncio.run(seed_data())
