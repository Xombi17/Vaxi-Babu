from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.models.household import Household

settings = get_settings()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

async def get_current_household(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> Household:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = None
        is_supabase = False
        
        # 1. Try Supabase Verification if secret is available
        if settings.supabase_jwt_secret:
            try:
                # Supabase uses HS256 by default
                payload = jwt.decode(
                    token, 
                    settings.supabase_jwt_secret, 
                    algorithms=["HS256"], 
                    options={"verify_aud": False} # Supabase uses 'authenticated' as aud
                )
                is_supabase = True
            except JWTError:
                pass

        # 2. Fallback to Local Secret
        if not payload:
            try:
                payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            except JWTError:
                raise credentials_exception

        # 3. Retrieve Household based on token type
        if is_supabase:
            # Supabase sub is the UUID
            user_id: str = payload.get("sub")
            if not user_id:
                raise credentials_exception
            # Look up by ID (which we now sync to Supabase ID) or auth_id
            stmt = select(Household).where((Household.id == user_id) | (Household.auth_id == user_id))
            result = await session.execute(stmt)
            household = result.scalars().first()
        else:
            # Local sub is the username
            username: str = payload.get("sub")
            if not username:
                raise credentials_exception
            result = await session.execute(select(Household).where(Household.username == username))
            household = result.scalars().first()

        if household is None:
            raise credentials_exception
        return household

    except (JWTError, httpx.HTTPError, ValueError) as e:
        log.warning("auth_validation_failed", error=str(e))
        raise credentials_exception


async def get_current_household_optional(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> Household | None:
    try:
        return await get_current_household(token, session)
    except HTTPException:
        return None
