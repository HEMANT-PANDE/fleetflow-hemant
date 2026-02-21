from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from sqlalchemy import func # type: ignore
from pydantic import BaseModel # type: ignore

from app.database import get_db # type: ignore
from app.models.expense import ExpenseLog # type: ignore
from app.models.maintenance import MaintenanceLog # type: ignore
from app.models.vehicle import Vehicle # type: ignore
from app.models.trip import Trip # type: ignore

router = APIRouter()

# Pydantic schemas for structured finance responses
class VehicleOperationalCostResponse(BaseModel):
    vehicle_id: int
    total_expenses: float
    total_maintenance: float
    total_operational_cost: float

class TripCostResponse(BaseModel):
    trip_id: int
    total_trip_cost: float

@router.get("/vehicle/{vehicle_id}/operational-cost", response_model=VehicleOperationalCostResponse)
def get_vehicle_operational_costs(vehicle_id: int, db: Session = Depends(get_db)):
    # Validate vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    total_expenses = db.query(func.sum(ExpenseLog.cost)).filter(ExpenseLog.vehicle_id == vehicle_id).scalar() or 0.0
    total_maintenance = db.query(func.sum(MaintenanceLog.cost)).filter(MaintenanceLog.vehicle_id == vehicle_id).scalar() or 0.0
    
    return {
        "vehicle_id": vehicle_id,
        "total_expenses": total_expenses,
        "total_maintenance": total_maintenance,
        "total_operational_cost": total_expenses + total_maintenance
    }

@router.get("/trip/{trip_id}/costs", response_model=TripCostResponse)
def get_trip_costs(trip_id: int, db: Session = Depends(get_db)):
    # Validate trip
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Accurate dynamic aggregation avoiding storing redundant summation on the Trip object
    total_trip_cost = db.query(func.sum(ExpenseLog.cost)).filter(ExpenseLog.trip_id == trip_id).scalar() or 0.0
    
    return {
        "trip_id": trip_id,
        "total_trip_cost": total_trip_cost
    }
