from datetime import datetime
from app.schemas.base import BaseSchema
from app.schemas.user import UserResponse

class ShiftBase(BaseSchema):
    start_time: datetime
    end_time: datetime

class ShiftCreate(ShiftBase):
    user_id: int

class ShiftResponse(ShiftBase):
    id: int
    user_id: int

class ShiftWithUserResponse(ShiftResponse):
    user: UserResponse | None = None