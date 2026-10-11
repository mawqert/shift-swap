from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, TokenPair, TokenPairWithUser, RefreshRequest
from app.services import user_service, jwt_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        return user_service.register_user(db, user_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenPairWithUser)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = user_service.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )

    tokens = jwt_service.issue_tokens(user.id)
    return TokenPairWithUser(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        user=user
    )


@router.post("/refresh", response_model=TokenPair)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    return jwt_service.refresh_tokens(db, data.refresh_token)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("", response_model=list[UserResponse])
def get_employees(_current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_service.get_all_employees(db)