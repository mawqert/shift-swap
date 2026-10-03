from sqlalchemy import select, and_
from sqlalchemy.orm import Session
from app.models.shift import Shift
from app.schemas.shift import ShiftCreate

def create_shift(db: Session, shift_in: ShiftCreate) -> Shift:
    if shift_in.start_time >= shift_in.end_time:
        raise ValueError("Время окончания смены должно быть позже времени начала")
    
    overlap = db.execute(
        select(Shift).where(
            Shift.user_id == shift_in.user_id,
            and_(
                Shift.start_time < shift_in.end_time,
                Shift.end_time > shift_in.start_time
            )
        )
    ).scalar_one_or_none()
    
    if overlap:
        raise ValueError("У сотрудника уже есть смена в это время")
        
    new_shift = Shift(
        user_id=shift_in.user_id,
        start_time=shift_in.start_time,
        end_time=shift_in.end_time
    )
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift

def get_user_schedule(db: Session, user_id: int) -> list[Shift]:
    result = db.execute(select(Shift).where(Shift.user_id == user_id).order_by(Shift.start_time))
    return list(result.scalars().all())

def get_all_shifts(db: Session) -> list[Shift]:
    result = db.execute(select(Shift).order_by(Shift.start_time))
    return list(result.scalars().all())