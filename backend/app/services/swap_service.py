from datetime import datetime, timedelta, timezone

from sqlalchemy import select, or_, and_
from sqlalchemy.orm import Session
from app.models.swap_request import SwapRequest, SwapRequestStatus
from app.models.shift import Shift
from app.schemas.swap_request import SwapRequestCreate

def _check_shift_overlaps(db: Session, user_id: int, new_shift: Shift, ignored_shift_id: int) -> bool:
    overlap = db.execute(
        select(Shift).where(
            Shift.user_id == user_id,
            Shift.id != ignored_shift_id,
            and_(
                Shift.start_time < new_shift.end_time,
                Shift.end_time > new_shift.start_time
            )
        )
    ).scalars().first()
    return bool(overlap)

def create_swap_request(db: Session, requester_id: int, request_in: SwapRequestCreate) -> SwapRequest:
    requester_shift = db.execute(select(Shift).where(Shift.id == request_in.requester_shift_id)).scalar_one_or_none()
    target_shift = db.execute(select(Shift).where(Shift.id == request_in.target_shift_id)).scalar_one_or_none()

    if not requester_shift or not target_shift:
        raise ValueError("Смена не найдена")
    if requester_shift.user_id != requester_id:
        raise PermissionError("Вы не можете предложить чужую смену")
    if target_shift.user_id == requester_id:
        raise ValueError("Нельзя поменяться сменами с самим собой")
        
    now_utc = datetime.now(tz=timezone.utc)
    limit_24h = now_utc + timedelta(hours=24)
    
    if requester_shift.start_time < limit_24h or target_shift.start_time < limit_24h:
         raise ValueError("Обмен возможен только для смен, которые начинаются не ранее чем через 24 часа")

    if _check_shift_overlaps(db, requester_id, target_shift, requester_shift.id):
         raise ValueError("Целевая смена пересекается с вашим текущим расписанием")
    if _check_shift_overlaps(db, target_shift.user_id, requester_shift, target_shift.id):
         raise ValueError("Ваша смена пересекается с расписанием целевого сотрудника")

    new_request = SwapRequest(
        requester_shift_id=requester_shift.id,
        target_shift_id=target_shift.id,
        requester_user_id=requester_id,
        target_user_id=target_shift.user_id,
        status=SwapRequestStatus.PENDING_COLLEAGUE
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

def get_user_request_history(db: Session, user_id: int) -> list[SwapRequest]:
    result = db.execute(
        select(SwapRequest)
        .where(or_(SwapRequest.requester_user_id == user_id, SwapRequest.target_user_id == user_id))
        .order_by(SwapRequest.created_at.desc())
    )
    return list(result.scalars().all())

def get_manager_history(db: Session) -> list[SwapRequest]:
    result = db.execute(
        select(SwapRequest)
        .where(SwapRequest.status.in_([SwapRequestStatus.APPROVED, SwapRequestStatus.REJECTED]))
        .order_by(SwapRequest.created_at.desc())
    )
    return list(result.scalars().all())

def get_user_requests(db: Session, user_id: int) -> list[SwapRequest]:
    result = db.execute(
        select(SwapRequest).where(
            or_(SwapRequest.requester_user_id == user_id, SwapRequest.target_user_id == user_id)
        )
    )
    return list(result.scalars().all())

def cancel_swap_request(db: Session, request_id: int, user_id: int) -> None:
    req = db.execute(select(SwapRequest).where(SwapRequest.id == request_id)).scalar_one_or_none()
    if not req:
        raise ValueError("Запрос не найден")
    if req.requester_user_id != user_id:
        raise PermissionError("Можно отменить только свой запрос")
    if req.status not in (SwapRequestStatus.PENDING_COLLEAGUE, SwapRequestStatus.PENDING_MANAGER):
        raise ValueError("Нельзя отменить уже обработанный запрос")
    
    db.delete(req)
    db.commit()

def respond_as_colleague(db: Session, request_id: int, user_id: int, accept: bool) -> SwapRequest:
    req = db.execute(select(SwapRequest).where(SwapRequest.id == request_id)).scalar_one_or_none()
    if not req or req.target_user_id != user_id:
        raise PermissionError("Запрос не найден или не предназначен вам")
    if req.status != SwapRequestStatus.PENDING_COLLEAGUE:
        raise ValueError("Запрос больше не ожидает вашего ответа")

    req.status = SwapRequestStatus.PENDING_MANAGER if accept else SwapRequestStatus.REJECTED
    db.commit()
    db.refresh(req)
    return req

def get_active_manager_requests(db: Session) -> list[SwapRequest]:
    result = db.execute(select(SwapRequest).where(SwapRequest.status == SwapRequestStatus.PENDING_MANAGER))
    return list(result.scalars().all())

def resolve_by_manager(db: Session, request_id: int, manager_id: int, accept: bool) -> SwapRequest:
    req = db.execute(select(SwapRequest).where(SwapRequest.id == request_id)).scalar_one_or_none()
    if not req:
        raise ValueError("Запрос не найден")
    if req.status != SwapRequestStatus.PENDING_MANAGER:
        raise ValueError("Запрос не ожидает решения менеджера")

    if accept:
        if _check_shift_overlaps(db, req.requester_user_id, req.target_shift, req.requester_shift.id) or \
           _check_shift_overlaps(db, req.target_user_id, req.requester_shift, req.target_shift.id):
            raise ValueError("Невозможно подтвердить обмен из-за возникшего пересечения смен")
            
        req.status = SwapRequestStatus.APPROVED
        req.requester_shift.user_id, req.target_shift.user_id = req.target_shift.user_id, req.requester_shift.user_id
    else:
        req.status = SwapRequestStatus.REJECTED
    
    req.manager_id = manager_id
    db.commit()
    db.refresh(req)
    return req