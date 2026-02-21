from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import List
from app.database import get_db # type: ignore
from app.models.expense import ExpenseLog # type: ignore
from app.models.vehicle import Vehicle # type: ignore
from app.models.trip import Trip # type: ignore
from app.schemas.expense import ExpenseLogCreate, ExpenseLogResponse # type: ignore

router = APIRouter()

@router.post("/", response_model=ExpenseLogResponse)
def create_expense(expense: ExpenseLogCreate, db: Session = Depends(get_db)):
    # 1. Validate vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == expense.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle does not exist")
        
    # 2. Validate trip exists and belongs to the specified vehicle
    if expense.trip_id is not None:
        trip = db.query(Trip).filter(Trip.id == expense.trip_id).first()
        if not trip:
            raise HTTPException(status_code=400, detail="Trip does not exist")
        if trip.vehicle_id != expense.vehicle_id:
            raise HTTPException(status_code=400, detail="Trip does not belong to the specified vehicle")
            
    new_expense = ExpenseLog(**expense.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[ExpenseLogResponse])
def get_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ExpenseLog).offset(skip).limit(limit).all()
