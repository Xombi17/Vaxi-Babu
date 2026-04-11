import asyncio
import uuid
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine
from app.models.household import Household
from app.models.dependent import Dependent, DependentType, Sex
from app.core.auth import get_password_hash

async def add_saanvi():
    async with AsyncSession(engine) as session:
        # Check if already exists
        from sqlalchemy import select
        q = select(Household).where(Household.username == "verma")
        existing = (await session.execute(q)).scalar_one_or_none()
        
        if existing:
            print(f"✅ Verma Family already exists (ID: {existing.id})")
            h_id = existing.id
        else:
            password_hash = get_password_hash("REMOVED_DEMO_PASSWORD")
            household = Household(
                id=str(uuid.uuid4()),
                username="verma",
                password_hash=password_hash,
                name="Verma Family",
                primary_language="en",
                village_town="Indore",
                state="Madhya Pradesh"
            )
            session.add(household)
            await session.flush()
            h_id = household.id
            print(f"🏠 Created Verma Family (ID: {h_id})")

        # Check if Saanvi exists
        q2 = select(Dependent).where(Dependent.name == "Saanvi")
        existing_child = (await session.execute(q2)).scalar_one_or_none()
        
        if existing_child:
            print(f"✅ Saanvi already exists (ID: {existing_child.id})")
        else:
            child = Dependent(
                id=str(uuid.uuid4()),
                household_id=h_id,
                name="Saanvi",
                type=DependentType.child,
                sex=Sex.female,
                date_of_birth=date(2018, 1, 1) # ~6 years old
            )
            session.add(child)
            print(f"👶 Created Saanvi")

        await session.commit()
        print("🎉 Transaction committed.")

if __name__ == "__main__":
    asyncio.run(add_saanvi())
