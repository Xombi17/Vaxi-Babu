from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, verify_password
from app.core.config import get_settings
from app.core.database import get_session
from app.models.household import Household

settings = get_settings()
router = APIRouter(tags=["Authentication"])

@router.post("/login")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session),
):
    """
    Standard OAuth2 compatible token login.
    Login with username and password to get a JWT access token.
    """
    result = await session.execute(
        select(Household).where(Household.username == form_data.username)
    )
    household = result.scalars().first()
    
    if not household or not verify_password(form_data.password, household.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": household.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "household_id": household.id}
