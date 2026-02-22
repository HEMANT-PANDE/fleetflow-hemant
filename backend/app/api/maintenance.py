from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.finance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.schemas.finance import (
    MaintenanceLogResponse,
    MaintenanceLogCreate
)
from app.models.enums import VehicleStatus

router = APIRouter()


# ==================================================
# CREATE MAINTENANCE LOG
# ==================================================
@router.post(
    "/",
    response_model=MaintenanceLogResponse,
    status_code=status.HTTP_201_CREATED
)
def create_maintenance_log(
    log: MaintenanceLogCreate,
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == log.vehicle_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    # 🚫 Prevent maintenance if vehicle is on trip
    if vehicle.status == VehicleStatus.ON_TRIP:
        raise HTTPException(
            status_code=400,
            detail="Cannot send vehicle to maintenance while On Trip"
        )

    # 🚫 Prevent duplicate maintenance
    if vehicle.status == VehicleStatus.IN_SHOP:
        raise HTTPException(
            status_code=400,
            detail="Vehicle is already in maintenance"
        )

    new_log = MaintenanceLog(**log.model_dump())
    new_log.started_at = datetime.utcnow()

    db.add(new_log)

    # 🔥 Move vehicle to IN_SHOP
    vehicle.status = VehicleStatus.IN_SHOP

    db.commit()
    db.refresh(new_log)

    return new_log


# ==================================================
# GET ALL MAINTENANCE LOGS
# ==================================================
@router.get("/", response_model=List[MaintenanceLogResponse])
def read_maintenance_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return (
        db.query(MaintenanceLog)
        .order_by(desc(MaintenanceLog.id))
        .offset(skip)
        .limit(limit)
        .all()
    )


# ==================================================
# COMPLETE MAINTENANCE
# ==================================================
@router.patch("/{log_id}/complete", response_model=MaintenanceLogResponse)
def complete_maintenance_service(
    log_id: int,
    db: Session = Depends(get_db)
):
    log = db.query(MaintenanceLog).filter(
        MaintenanceLog.id == log_id
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Maintenance log not found"
        )

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == log.vehicle_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    # 🚫 Prevent double completion
    if vehicle.status != VehicleStatus.IN_SHOP:
        raise HTTPException(
            status_code=400,
            detail="Vehicle is not currently in maintenance"
        )

    # 🔥 Release vehicle
    vehicle.status = VehicleStatus.AVAILABLE

    # Optional: mark completion time
    log.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(log)

    return log