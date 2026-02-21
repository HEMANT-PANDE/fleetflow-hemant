from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database import SessionLocal
from app.models.driver import Driver
from app.models.trip import Trip
from app.schemas.driver import DriverResponse, StatusUpdate, DriverCreate
from app.models.enums import DriverStatus, TripStatus

router = APIRouter(prefix="/drivers", tags=["Driver Performance"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🔹 ADD NEW DRIVER
# =====================================================
@router.post("/", response_model=DriverResponse)
def create_driver(driver_data: DriverCreate, db: Session = Depends(get_db)):

    existing = db.query(Driver).filter(
        Driver.license_number == driver_data.license_number
    ).first()

    if existing:
        raise HTTPException(400, "Driver with this license already exists")

    new_driver = Driver(
        name=driver_data.name,
        license_number=driver_data.license_number,
        license_category=driver_data.license_category,
        license_expiry_date=driver_data.license_expiry_date,
    )

    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)

    return {
        **new_driver.__dict__,
        "license_valid": new_driver.license_expiry_date >= date.today()
    }


# =====================================================
# 🔹 GET ALL DRIVERS
# =====================================================
@router.get("/", response_model=list[DriverResponse])
def get_all_drivers(db: Session = Depends(get_db)):

    drivers = db.query(Driver).all()

    result = []

    for driver in drivers:
        total_trips = db.query(Trip).filter(
            Trip.driver_id == driver.id
        ).count()

        completed_trips = db.query(Trip).filter(
            Trip.driver_id == driver.id,
            Trip.status == TripStatus.COMPLETED
        ).count()

        if total_trips > 0:
            driver.trip_completion_rate = (completed_trips / total_trips) * 100
        else:
            driver.trip_completion_rate = 100.0

        result.append({
            **driver.__dict__,
            "license_valid": driver.license_expiry_date >= date.today()
        })

    db.commit()
    return result


# =====================================================
# 🔹 TOGGLE DRIVER STATUS
# =====================================================
@router.patch("/{driver_id}/status")
def toggle_driver_status(
    driver_id: int,
    status_update: StatusUpdate,
    db: Session = Depends(get_db)
):

    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        raise HTTPException(404, "Driver not found")

    driver.status = status_update.status
    db.commit()

    return {
        "message": "Driver status updated",
        "new_status": driver.status
    }


# =====================================================
# 🔹 VALIDATE DRIVER BEFORE TRIP
# =====================================================
@router.get("/{driver_id}/validate")
def validate_driver(driver_id: int, db: Session = Depends(get_db)):

    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        raise HTTPException(404, "Driver not found")

    if driver.status != DriverStatus.ON_DUTY:
        raise HTTPException(400, "Driver not On Duty")

    if driver.status == DriverStatus.SUSPENDED:
        raise HTTPException(403, "Driver Suspended")

    if driver.license_expiry_date < date.today():
        raise HTTPException(400, "License Expired")

    return {"message": "Driver eligible for trip"}