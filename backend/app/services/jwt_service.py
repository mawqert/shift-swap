from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import app_config
from app.models.user import User
from app.schemas.user import TokenPair


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=60)
    return jwt.encode({"sub": str(user_id), "exp": expires}, app_config.JWT_ACCESS_SECRET, algorithm="HS256")


def create_refresh_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({"sub": str(user_id), "exp": expires}, app_config.JWT_REFRESH_SECRET, algorithm="HS256")


def issue_tokens(user_id: int) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


def refresh_tokens(db: Session, refresh_token: str) -> TokenPair:
    try:
        payload = jwt.decode(refresh_token, app_config.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token недействителен"
            )

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден"
            )

        return issue_tokens(int(user_id))

    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token недействителен"
        )