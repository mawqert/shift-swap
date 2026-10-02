import enum
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.shift import Shift


class Role(enum.StrEnum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"


class User(Base):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(default=Role.EMPLOYEE, nullable=False)

    shifts: Mapped[list["Shift"]] = relationship(
        back_populates="user", 
        cascade="all, delete-orphan"
    )