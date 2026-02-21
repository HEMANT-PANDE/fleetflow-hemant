from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleResponse, VehicleCreate
from app.models.enums import VehicleStatus

router = APIRouter()

@router.post("/vehicles/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = db.query(Vehicle).filter(Vehicle.license_plate == vehicle.license_plate).first()
    if db_vehicle:
        raise HTTPException(status_code=400, detail="License plate already registered")
    
    new_vehicle = Vehicle(**vehicle.model_dump())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.get("/vehicles/", response_model=List[VehicleResponse])
def read_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).offset(skip).limit(limit).all()
    return vehicles

@router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
def read_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.patch("/vehicles/{vehicle_id}/out-of-service", response_model=VehicleResponse)
def toggle_out_of_service(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if vehicle.status == VehicleStatus.OUT_OF_SERVICE:
        vehicle.status = VehicleStatus.AVAILABLE
    else:
        vehicle.status = VehicleStatus.OUT_OF_SERVICE
        
    db.commit()
    db.refresh(vehicle)
    return vehicle
