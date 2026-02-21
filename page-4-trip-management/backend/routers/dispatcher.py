from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Vehicle, Driver, Trip, VehicleStatus, DriverStatus, TripStatus
from ..schemas import VehicleSchema, DriverSchema, TripSchema, TripCreate
from ..redis_client import VehicleLockManager, PubSubManager

router = APIRouter(prefix="/api", tags=["dispatcher"])

# ----------------- #
#  Vehicles
# ----------------- #
@router.get("/vehicles/available", response_model=List[VehicleSchema])
def get_available_vehicles(db: Session = Depends(get_db)):
    """Fetch list of vehicles not 'In Shop' or 'On Trip'."""
    vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.AVAILABLE).all()
    return vehicles

@router.post("/vehicles/{vehicle_id}/lock")
def lock_vehicle(vehicle_id: int, dispatcher_id: int):
    """Dispatcher selects a vehicle; we lock it in Redis."""
    success = VehicleLockManager.lock_vehicle(vehicle_id, dispatcher_id)
    if not success:
        raise HTTPException(status_code=409, detail="Vehicle is currently locked by another dispatcher.")
    return {"message": "Vehicle locked successfully."}

@router.post("/vehicles/{vehicle_id}/unlock")
def unlock_vehicle(vehicle_id: int, dispatcher_id: int):
    """Dispatcher deselects a vehicle; remove the Redis lock."""
    success = VehicleLockManager.unlock_vehicle(vehicle_id, dispatcher_id)
    if not success:
        raise HTTPException(status_code=400, detail="Could not retrieve or you do not own the lock on this vehicle.")
    return {"message": "Vehicle unlocked successfully."}

# ----------------- #
#  Drivers
# ----------------- #
@router.get("/drivers/available", response_model=List[DriverSchema])
def get_available_drivers(db: Session = Depends(get_db)):
    """Fetch list of drivers with a valid license and not 'On Trip'."""
    drivers = db.query(Driver).filter(
        Driver.status == DriverStatus.ON_DUTY
        # You can add logic here to filter based on license_expiry_date
    ).all()
    return drivers

# ----------------- #
#  Trips
# ----------------- #
@router.post("/trips", response_model=TripSchema)
def create_trip(trip: TripCreate, dispatcher_id: int, db: Session = Depends(get_db)):
    """Create a new trip. Validates cargo weight."""
    
    # 1. Check if vehicle is locked by this dispatcher OR available to be locked
    is_locked = VehicleLockManager.is_locked(trip.vehicle_id)
    if is_locked and not VehicleLockManager.unlock_vehicle(trip.vehicle_id, dispatcher_id):
          # Ensure the person making the trip request is actually the lock holder
          raise HTTPException(status_code=409, detail="Vehicle is locked by another dispatcher.")

    # 2. Get Vehicle & Driver
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()

    if not vehicle or vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Vehicle is invalid or not available.")
    
    if not driver or driver.status != DriverStatus.ON_DUTY:
        raise HTTPException(status_code=400, detail="Driver is invalid or not available.")

    # 3. Validation Logic: Prevent trip creation if CargoWeight > MaxCapacity
    if trip.cargo_weight > vehicle.max_capacity:
        raise HTTPException(
            status_code=400, 
            detail=f"Cargo weight ({trip.cargo_weight}) exceeds vehicle capacity ({vehicle.max_capacity})."
        )
    
    # 4. Create Trip
    new_trip = Trip(
        vehicle_id=trip.vehicle_id,
        driver_id=trip.driver_id,
        cargo_weight=trip.cargo_weight,
        start_location=trip.start_location,
        end_location=trip.end_location,
        status=TripStatus.DISPATCHED
    )

    # 5. Update Statuses
    vehicle.status = VehicleStatus.ON_TRIP
    # Note: Driver status remains ON_DUTY while on trip in the current DB schema.

    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    # 6. Publish real-time update
    PubSubManager.publish_update("fleet_updates", {
        "event": "trip_created",
        "trip_id": new_trip.id,
        "vehicle_id": vehicle.id,
        "driver_id": driver.id
    })
    
    # Always unlock the vehicle lock on successful trip creation
    VehicleLockManager.unlock_vehicle(trip.vehicle_id, dispatcher_id)

    return new_trip
