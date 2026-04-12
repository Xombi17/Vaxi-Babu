from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from sqlmodel import Session, select
from app.models.household import Household
from app.models.dependent import Dependent, DependentType

class HealthScheme(BaseModel):
    id: str
    name: str
    description: str
    benefits: str
    eligibility_reason: str
    category: str  # "maternal", "child", "general", "senior"
    icon: str  # Lucide icon name

async def get_eligible_schemes(household: Household, session: Session) -> List[HealthScheme]:
    """
    Match household profile to government health schemes using deterministic logic.
    """
    schemes = []
    
    # 1. Ayushman Bharat (PM-JAY)
    # Eligibility in rural areas often based on deprivation (simulated here)
    schemes.append(HealthScheme(
        id="pmjay",
        name="Ayushman Bharat (PM-JAY)",
        description="World's largest health assurance scheme providing ₹5 lakh coverage per family.",
        benefits="Cashless hospitalisation up to ₹5 lakh per year in any empanelled hospital.",
        eligibility_reason="Standard coverage for families in rural/economically weaker sections.",
        category="general",
        icon="Shield"
    ))

    # 2. Janani Suraksha Yojana (JSY)
    # Check for pregnant women
    stmt = select(Dependent).where(Dependent.household_id == household.id).where(Dependent.type == DependentType.pregnant)
    res = await session.execute(stmt)
    pregnant_members = res.scalars().all()
    
    if pregnant_members:
        schemes.append(HealthScheme(
            id="jsy",
            name="Janani Suraksha Yojana",
            description="Safe motherhood intervention promoting institutional delivery.",
            benefits="Direct cash assistance for hospital delivery and post-natal care.",
            eligibility_reason=f"Matched for {pregnant_members[0].name} (Pregnant Member).",
            category="maternal",
            icon="Heart"
        ))

    # 3. Mission Indradhanush (Vaccination Focus)
    # Check for young children (< 2 years)
    stmt = select(Dependent).where(Dependent.household_id == household.id).where(Dependent.type == DependentType.child)
    res = await session.execute(stmt)
    children = res.scalars().all()
    
    today = date.today()
    has_young_child = False
    youngest_name = ""
    for child in children:
        age_days = (today - child.date_of_birth).days
        if age_days < 730:  # 2 years
            has_young_child = True
            youngest_name = child.name
            break
            
    if has_young_child:
        schemes.append(HealthScheme(
            id="indradhanush",
            name="Mission Indradhanush",
            description="Full immunization coverage for all children and pregnant women.",
            benefits="Access to all vaccines in the National Immunization Schedule.",
            eligibility_reason=f"Matched for {youngest_name} (Child under 2 years).",
            category="child",
            icon="Syringe"
        ))

    # 4. PM Jan Arogya Yojana - Senior Citizens (New 2024 Expansion)
    # Check for members > 70 years
    has_senior = False
    for member in children + pregnant_members: # Check all (though types might vary, date_of_birth is common)
        pass # Better to query all dependents
        
    stmt = select(Dependent).where(Dependent.household_id == household.id)
    res = await session.execute(stmt)
    all_members = res.scalars().all()
    
    for member in all_members:
        age_years = (today - member.date_of_birth).days // 365
        if age_years >= 70:
            schemes.append(HealthScheme(
                id="pmjay-senior",
                name="AB PM-JAY (Senior Plus)",
                description="Special top-up health coverage for senior citizens.",
                benefits="Dedicated ₹5 lakh coverage for seniors aged 70+, regardless of income.",
                eligibility_reason=f"Matched for {member.name} (Veteran Health Benefit).",
                category="senior",
                icon="Award"
            ))
            break

    return schemes
