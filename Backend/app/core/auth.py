import json
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
import structlog
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.core.password_service import PasswordService
from app.models.household import Household

settings = get_settings()
log = structlog.get_logger()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hash."""
    return PasswordService.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain text password."""
    return PasswordService.hash(password)


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
        
        # 1. Try Supabase Verification
        if settings.supabase_jwt_secret or settings.supabase_jwk:
            try:
                # Peek at algorithm
                unverified_header = jwt.get_unverified_header(token)
                alg = unverified_header.get("alg", "HS256")
                log.debug("auth_token_header", alg=alg)

                verification_key = settings.supabase_jwt_secret
                verification_algs = ["HS256"]

                if alg == "ES256" and settings.supabase_jwk:
                    verification_key = json.loads(settings.supabase_jwk)
                    verification_algs = ["ES256"]
                elif alg == "HS256" and not settings.supabase_jwt_secret:
                    log.warning("auth_missing_secret_for_hs256")
                    raise JWTError("Missing HS256 secret")

                payload = jwt.decode(
                    token, 
                    verification_key, 
                    algorithms=verification_algs, 
                    options={"verify_aud": False, "leeway": 60}
                )
                is_supabase = True
                log.debug("auth_supabase_verified", user_id=payload.get("sub"))
            except (JWTError, json.JSONDecodeError) as e:
                log.debug("auth_supabase_failed", error=str(e), alg=alg if 'alg' in locals() else 'unknown')
                # Fallback to local key if not verified by Supabase

        # 2. Fallback to Local Secret (for backend-to-backend or legacy tokens)
        if not payload:
            try:
                payload = jwt.decode(
                    token, 
                    settings.secret_key, 
                    algorithms=[settings.algorithm], 
                    options={"leeway": 60}
                )
                log.debug("auth_local_verified", sub=payload.get("sub"))
            except JWTError as e:
                log.warning("auth_all_failed", error=str(e))
                raise credentials_exception

        # 3. Retrieve/Construct Household based on token type
        if is_supabase:
            user_id: str = payload.get("sub")
            if not user_id:
                log.error("auth_payload_missing_sub")
                raise credentials_exception

            # Trust Supabase: return a virtual household object without DB lookup.
            # This allows the app to function even if public.households record doesn't exist.
            metadata = payload.get("user_metadata", {})
            email = payload.get("email", metadata.get("email", ""))
            name = metadata.get("name", email.split('@')[0] if email else "User")

            return Household(
                id=user_id,
                username=email or user_id,
                name=name,
                auth_id=user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

        # 4. Fallback to Local Database (for non-Supabase tokens)
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception

        result = await session.execute(select(Household).where(Household.username == username))
        household = result.scalars().first()

        if household is None:
            raise credentials_exception
        return household

    except (JWTError, httpx.HTTPError, ValueError) as e:
        log.warning("auth_unexpected_error", error=str(e))
        raise credentials_exception


async def get_current_household_optional(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> Household | None:
    try:
        return await get_current_household(token, session)
    except HTTPException:
        return None
