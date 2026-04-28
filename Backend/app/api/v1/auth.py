import structlog
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlmodel import Session, select

from app.core.auth import create_access_token, verify_password
from app.core.database import get_session
from app.models.household import Household

log = structlog.get_logger()
router = APIRouter(tags=["Authentication"])


def _normalize_username(username: str) -> str:
    normalized = username.strip()
    # Treat email-style usernames case-insensitively.
    if "@" in normalized:
        normalized = normalized.lower()
    return normalized

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """
    Standard OAuth2 compatible token login.
    Used by the demo login system and manual logins.
    """
    normalized_username = _normalize_username(form_data.username)
    stmt = select(Household).where(Household.username == normalized_username)
    result = await session.execute(stmt)
    household = result.scalar_one_or_none()

    password_ok = False
    if household and household.password_hash:
        try:
            password_ok = verify_password(form_data.password, household.password_hash)
        except Exception:
            password_ok = False

    if not household or not password_ok:
        log.warning("login_failed", username=normalized_username)
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
async def sync_supabase_auth(session: Session = Depends(get_session)):
    """
    Synchronizes users from Supabase auth.users into the public.households table.
    Ensures every authenticated Supabase user has a corresponding family profile.
    Normally handled by a DB trigger, but this provides a manual fallback.
    """
    try:
        # 1. Fetch all users from Supabase Auth schema
        auth_users_query = text("SELECT id, email, raw_user_meta_data FROM auth.users")
        result = await session.execute(auth_users_query)
        auth_users = result.fetchall()
        
        synced_count = 0
        new_count = 0
        
        for auth_user in auth_users:
            auth_id = str(auth_user[0])
            email = auth_user[1]
            meta = auth_user[2] or {}
            name = meta.get("name") or f"{email.split('@')[0]}'s Family"
            
            # 2. Check if this auth user already has a household profile
            stmt = select(Household).where(Household.id == auth_id)
            existing = (await session.execute(stmt)).scalar_one_or_none()
            
            if not existing:
                # 3. Create a new Household profile linked to this Supabase ID
                new_h = Household(
                    id=auth_id,
                    username=email,
                    auth_id=auth_id,
                    name=name,
                    primary_language=meta.get("language", "en")
                )
                session.add(new_h)
                new_count += 1
                log.info("supabase_auth_sync_created_household", email=email, auth_id=auth_id)
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
        log.error("supabase_auth_sync_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to sync with Supabase Auth: {str(e)}")
