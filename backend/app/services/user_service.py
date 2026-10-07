from sqlalchemy import select
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from app.models.user import User
from app.schemas.user import UserCreate

pwd_context = PasswordHash.recommended()

def register_user(db: Session, user_in: UserCreate) -> User:
    existing_user = db.execute(select(User).where(User.email == user_in.email)).scalar_one_or_none()
    if existing_user:
        raise ValueError("Пользователь с таким email уже существует")
    
    hashed_pwd = pwd_context.hash(user_in.password)
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

def get_all_employees(db: Session) -> list[User]:
    return db.execute(select(User).where(User.role == "EMPLOYEE")).scalars().all()