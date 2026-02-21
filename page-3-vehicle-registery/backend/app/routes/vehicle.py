from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.enums import VehicleStatus
from app.schemas.vehicle import VehicleCreate

router = APIRouter(prefix="/api/vehicles", tags=["Vehicle Registry"])

@router.post("/")
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.get("/")
def get_all_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@router.patch("/{vehicle_id}/toggle-out-of-service")
def toggle_out_of_service(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status == VehicleStatus.OUT_OF_SERVICE:
        vehicle.status = VehicleStatus.AVAILABLE
    else:
        vehicle.status = VehicleStatus.OUT_OF_SERVICE

    db.commit()
    db.refresh(vehicle)
    return vehicle