from pydantic import EmailStr
from app.models.user import Role
from app.schemas.base import BaseSchema

class UserBase(BaseSchema):
    email: EmailStr
    full_name: str
    role: Role = Role.EMPLOYEE

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int