from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.schemas.trip import TripResponse, TripCreate, TripComplete
from app.models.enums import TripStatus, VehicleStatus, DriverStatus

router = APIRouter()


# ==================================================
# CREATE TRIP (Creates Draft)
# ==================================================
@router.post(
    "/trips/",
    response_model=TripResponse,
    status_code=status.HTTP_201_CREATED
)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle not available. Current status: {vehicle.status.value}"
        )

    if trip.cargo_weight <= 0:
        raise HTTPException(
            status_code=400,
            detail="Cargo weight must be positive"
        )

    if trip.cargo_weight > vehicle.max_capacity:
        raise HTTPException(
            status_code=400,
            detail="Cargo weight exceeds vehicle capacity"
        )

    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if driver.status != DriverStatus.ON_DUTY:
        raise HTTPException(
            status_code=400,
            detail=f"Driver not on duty. Current status: {driver.status.value}"
        )

    new_trip = Trip(**trip.model_dump())
    new_trip.status = TripStatus.DRAFT

    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    return new_trip


# ==================================================
# GET ALL TRIPS
# ==================================================
@router.get("/trips/", response_model=List[TripResponse])
def get_all_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Trip).offset(skip).limit(limit).all()


# ==================================================
# DISPATCH TRIP
# ==================================================
@router.post("/trips/{trip_id}/dispatch", response_model=TripResponse)
def dispatch_trip(trip_id: int, db: Session = Depends(get_db)):

    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.status != TripStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Only DRAFT trips can be dispatched"
        )

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail="Vehicle no longer available"
        )

    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if driver.status != DriverStatus.ON_DUTY:
        raise HTTPException(
            status_code=400,
            detail=f"Driver not available. Current status: {driver.status.value}"
        )

    # 🔥 Update Lifecycle States
    trip.status = TripStatus.DISPATCHED
    vehicle.status = VehicleStatus.ON_TRIP
    driver.status = DriverStatus.OFF_DUTY

    db.commit()
    db.refresh(trip)

    return trip


# ==================================================
# COMPLETE TRIP
# ==================================================
@router.post("/trips/{trip_id}/complete", response_model=TripResponse)
def complete_trip(
    trip_id: int,
    completion_data: TripComplete,
    db: Session = Depends(get_db)
):

    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.status != TripStatus.DISPATCHED:
        raise HTTPException(
            status_code=400,
            detail="Only DISPATCHED trips can be completed"
        )

    if completion_data.final_odometer <= 0:
        raise HTTPException(
            status_code=400,
            detail="Final odometer must be positive"
        )

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()

    # 🔥 Update Lifecycle States
    trip.status = TripStatus.COMPLETED
    trip.final_odometer = completion_data.final_odometer
    trip.completed_at = datetime.utcnow()

    if vehicle:
        vehicle.status = VehicleStatus.AVAILABLE

    if driver:
        driver.status = DriverStatus.ON_DUTY

    db.commit()
    db.refresh(trip)

    return trip