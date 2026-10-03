from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.swap_request import SwapRequestCreate, SwapRequestResponse, SwapRequestAction
from app.services import swap_service

router = APIRouter(prefix="/swap-requests", tags=["Swap Requests"])

@router.post("/", response_model=SwapRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    request_in: SwapRequestCreate, 
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        return swap_service.create_swap_request(db, user_id, request_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.get("/my-history", response_model=list[SwapRequestResponse])
def get_my_requests(user_id: int, db: Session = Depends(get_db)):
    return swap_service.get_user_request_history(db, user_id)

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_request(request_id: int, user_id: int, db: Session = Depends(get_db)):
    try:
        swap_service.cancel_swap_request(db, request_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.post("/{request_id}/respond", response_model=SwapRequestResponse)
def respond_to_request(
    request_id: int, 
    action: SwapRequestAction, 
    user_id: int, 
    db: Session = Depends(get_db)
):
    try:
        return swap_service.respond_as_colleague(db, request_id, user_id, action.accept)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))



@router.get("/manager/active", response_model=list[SwapRequestResponse])
def get_active_manager_requests(db: Session = Depends(get_db)):
    return swap_service.get_active_manager_requests(db)

@router.get("/manager/history", response_model=list[SwapRequestResponse])
def get_manager_history(db: Session = Depends(get_db)):
    return swap_service.get_manager_resolved_history(db)

@router.post("/{request_id}/resolve", response_model=SwapRequestResponse)
def resolve_request(
    request_id: int, 
    action: SwapRequestAction, 
    manager_id: int, 
    db: Session = Depends(get_db)
):
    try:
        return swap_service.resolve_by_manager(db, request_id, manager_id, action.accept)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))