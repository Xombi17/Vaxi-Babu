import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.household import Household
from typing import Any

log = structlog.get_logger()
router = APIRouter(tags=["Authentication"])

from fastapi.security import OAuth2PasswordRequestForm
from app.core.auth import create_access_token, verify_password

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """
    Standard OAuth2 compatible token login.
    Used by the demo login system and manual logins.
    """
    stmt = select(Household).where(Household.username == form_data.username)
    result = await session.execute(stmt)
    household = result.scalar_one_or_none()

    if not household or not verify_password(form_data.password, household.password_hash):
        log.warning("login_failed", username=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": household.username})
    
    log.info("login_success", username=household.username, household_id=household.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "household_id": household.id
    }

@router.post("/auth/sync", response_model=dict[str, Any])
async def sync_neon_auth(session: Session = Depends(get_session)):
    """
    Synchronizes users from neon_auth.user into the public.households table.
    Ensures every authenticated Neon user has a corresponding family profile.
    """
    try:
        # 1. Fetch all users from Neon Auth schema
        auth_users_query = text("SELECT id, email, name FROM neon_auth.user")
        result = await session.execute(auth_users_query)
        auth_users = result.fetchall()
        
        synced_count = 0
        new_count = 0
        
        for auth_user in auth_users:
            auth_id = str(auth_user[0])
            email = auth_user[1]
            name = auth_user[2] or f"{email.split('@')[0]}'s Family"
            
            # 2. Check if this auth user already has a household profile
            stmt = select(Household).where(Household.auth_id == auth_id)
            existing = (await session.execute(stmt)).scalar_one_or_none()
            
            if not existing:
                # 3. Create a new Household profile linked to this Auth ID
                # We use a dummy password_hash because Neon handles the real auth
                new_h = Household(
                    username=email,
                    password_hash="NEON_AUTH_MANAGED",
                    auth_id=auth_id,
                    name=name,
                    primary_language="en"
                )
                session.add(new_h)
                new_count += 1
                log.info("neon_auth_sync_created_household", email=email, auth_id=auth_id)
            else:
                synced_count += 1
        
        await session.commit()
        
        return {
            "status": "success",
            "synced": synced_count,
            "created": new_count,
            "total_auth_users": len(auth_users)
        }
        
    except Exception as e:
        log.error("neon_auth_sync_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to sync with Neon Auth: {str(e)}")
