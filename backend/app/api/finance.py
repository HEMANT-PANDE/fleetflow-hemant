from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.finance import ExpenseLog, FuelLog
from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.schemas.finance import ExpenseLogResponse, ExpenseLogCreate, FuelLogResponse, FuelLogCreate

router = APIRouter()

@router.post("/expenses/", response_model=ExpenseLogResponse, status_code=status.HTTP_201_CREATED)
def create_expense_log(expense: ExpenseLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == expense.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if expense.trip_id:
        trip = db.query(Trip).filter(Trip.id == expense.trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

    new_expense = ExpenseLog(**expense.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/expenses/", response_model=List[ExpenseLogResponse])
def read_expense_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    expenses = db.query(ExpenseLog).offset(skip).limit(limit).all()
    return expenses


@router.post("/fuel/", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED)
def create_fuel_log(fuel: FuelLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == fuel.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    new_fuel = FuelLog(**fuel.model_dump())
    db.add(new_fuel)
    db.commit()
    db.refresh(new_fuel)
    return new_fuel

@router.get("/fuel/", response_model=List[FuelLogResponse])
def read_fuel_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    fuel_logs = db.query(FuelLog).offset(skip).limit(limit).all()
    return fuel_logs
