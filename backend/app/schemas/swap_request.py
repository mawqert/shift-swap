from datetime import datetime
from app.models.swap_request import SwapRequestStatus
from app.schemas.base import BaseSchema
from app.schemas.user import UserResponse
from app.schemas.shift import ShiftResponse


class SwapRequestBase(BaseSchema):
    requester_shift_id: int
    target_shift_id: int
    requester_user_id: int
    target_user_id: int


class SwapRequestCreate(SwapRequestBase):
    pass


class SwapRequestResponse(SwapRequestBase):
    id: int
    status: SwapRequestStatus
    manager_id: int | None = None
    created_at: datetime


class SwapRequestDetailsResponse(SwapRequestResponse):
    requester_user: UserResponse
    target_user: UserResponse

    requester_shift: ShiftResponse
    target_shift: ShiftResponse

    manager: UserResponse | None = None