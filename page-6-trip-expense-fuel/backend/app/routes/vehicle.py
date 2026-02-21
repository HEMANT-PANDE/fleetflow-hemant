from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from typing import List
from app.database import get_db # type: ignore
from app.models.vehicle import Vehicle # type: ignore
from app.schemas.vehicle import VehicleCreate, VehicleResponse # type: ignore

router = APIRouter()

@router.post("/", response_model=VehicleResponse)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = db.query(Vehicle).filter(Vehicle.license_plate == vehicle.license_plate).first()
    if db_vehicle:
        raise HTTPException(status_code=400, detail="License plate already registered")
    
    new_vehicle = Vehicle(**vehicle.model_dump())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Vehicle).offset(skip).limit(limit).all()
