import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.shift import Shift
    from app.models.user import User


class SwapRequestStatus(enum.StrEnum):
    PENDING_COLLEAGUE = "PENDING_COLLEAGUE"
    PENDING_MANAGER = "PENDING_MANAGER"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class SwapRequest(Base):
    __tablename__ = "swap_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    requester_shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)
    target_shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)

    requester_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    status: Mapped[SwapRequestStatus] = mapped_column(
        default=SwapRequestStatus.PENDING_COLLEAGUE,
        nullable=False
    )

    manager_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), default=None)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    requester_user: Mapped["User"] = relationship(foreign_keys=[requester_user_id])
    target_user: Mapped["User"] = relationship(foreign_keys=[target_user_id])
    manager: Mapped["User | None"] = relationship(foreign_keys=[manager_id])

    requester_shift: Mapped["Shift"] = relationship(foreign_keys=[requester_shift_id])
    target_shift: Mapped["Shift"] = relationship(foreign_keys=[target_shift_id])