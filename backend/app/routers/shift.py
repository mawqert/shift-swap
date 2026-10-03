from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.shift import ShiftCreate, ShiftResponse
from app.services import shift_service

router = APIRouter(prefix="/shifts", tags=["Shifts"])

@router.post("/", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
def create_shift(shift_in: ShiftCreate, db: Session = Depends(get_db)):
    try:
        return shift_service.create_shift(db, shift_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/user/{user_id}", response_model=list[ShiftResponse])
def get_schedule(user_id: int, db: Session = Depends(get_db)):
    return shift_service.get_user_schedule(db, user_id)

@router.get("/", response_model=list[ShiftResponse])
def get_all_shifts(db: Session = Depends(get_db)):
    return shift_service.get_all_shifts(db)