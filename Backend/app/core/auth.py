import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
import structlog
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select
from sqlalchemy import or_
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
                    options={"verify_aud": True, "leeway": 10},
                    audience="authenticated",
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

            # Robust extraction of email/username
            metadata = payload.get("user_metadata", {})
            email = payload.get("email", metadata.get("email", ""))
            normalized_email = email.lower().strip() if email else None
            
            # Search by ID, Auth ID, or Username
            # This handles cases where a user exists with a different ID (e.g. from demo)
            # but now logs in via Supabase with the same email.
            search_conditions = [Household.id == user_id]
            try:
                auth_id_uuid = uuid.UUID(user_id)
                search_conditions.append(Household.auth_id == auth_id_uuid)
            except (ValueError, TypeError):
                auth_id_uuid = None
                
            if normalized_email:
                search_conditions.append(Household.username == normalized_email)
                
            result = await session.execute(select(Household).where(or_(*search_conditions)))
            household = result.scalars().first()

            if not household:
                # Auto-create household if it doesn't exist (Trusting Supabase Auth)
                log.info("auth_auto_creating_household", user_id=user_id)
                
                # Robust username (min 3 chars)
                username = normalized_email if normalized_email and len(normalized_email) >= 3 else f"user_{user_id[:8]}"
                # Robust name
                name = metadata.get("name") or (email.split('@')[0] if email else "Family User")
                if not name or len(name) < 1:
                    name = "New Family"

                household = Household(
                    id=user_id,
                    username=username,
                    name=name,
                    auth_id=auth_id_uuid,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                session.add(household)
                await session.flush()
                # No refresh here to avoid detachment issues
            else:
                # If found but auth_id is missing or different, link it
                if auth_id_uuid and household.auth_id != auth_id_uuid:
                    log.info("auth_linking_existing_household", username=household.username, user_id=user_id)
                    household.auth_id = auth_id_uuid
                    # Mark as managed by Supabase if it wasn't already
                    if household.password_hash != "SUPABASE_AUTH_MANAGED":
                        household.password_hash = "SUPABASE_AUTH_MANAGED"
                    household.updated_at = datetime.now(timezone.utc)
                    session.add(household)
                    await session.flush()

            return household

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
