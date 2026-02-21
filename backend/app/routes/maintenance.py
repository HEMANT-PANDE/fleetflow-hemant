"""
Page 5: Maintenance & Service Logs Routes

Features:
- Preventive and reactive health tracking
- Logic Link: Adding a log changes vehicle status to "In Shop" (hidden from Dispatcher)
- Complete maintenance to release vehicle back to "Available"
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models import MaintenanceLog, Vehicle, VehicleStatus, MaintenanceType
from app.schemas import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceComplete,
    MaintenanceResponse,
)

router = APIRouter(prefix="/maintenance", tags=["Maintenance & Service Logs"])


@router.get("/", response_model=List[MaintenanceResponse])
def get_maintenance_logs(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    maintenance_type: Optional[MaintenanceType] = None,
    is_completed: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """
    Get all maintenance logs with optional filtering.
    
    Filters:
    - vehicle_id: Filter by specific vehicle
    - maintenance_type: Filter by preventive/reactive/scheduled
    - is_completed: Filter by completion status
    """
    query = db.query(MaintenanceLog)

    if vehicle_id:
        query = query.filter(MaintenanceLog.vehicle_id == vehicle_id)
    if maintenance_type:
        query = query.filter(MaintenanceLog.maintenance_type == maintenance_type)
    if is_completed is not None:
        query = query.filter(MaintenanceLog.is_completed == is_completed)

    return query.order_by(MaintenanceLog.service_date.desc()).offset(skip).limit(limit).all()


@router.get("/{log_id}", response_model=MaintenanceResponse)
def get_maintenance_log(log_id: int, db: Session = Depends(get_db)):
    """Get a specific maintenance log by ID."""
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return log


@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_log(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new maintenance log.
    
    Business Logic:
    - Validates that vehicle exists and is not on a trip
    - Automatically sets vehicle status to "IN_SHOP"
    - Vehicle becomes hidden from dispatcher until maintenance is completed
    - Calculates total_cost = parts_cost + labor_cost
    """
    # Validate vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Cannot add maintenance for vehicle on trip
    if vehicle.status == VehicleStatus.ON_TRIP:
        raise HTTPException(
            status_code=400,
            detail="Cannot schedule maintenance for vehicle currently on a trip"
        )

    # Calculate total cost
    total_cost = maintenance.parts_cost + maintenance.labor_cost

    # Create maintenance log
    db_log = MaintenanceLog(
        **maintenance.model_dump(),
        total_cost=total_cost,
    )
    db.add(db_log)

    # Update vehicle status to IN_SHOP (hidden from dispatcher)
    vehicle.status = VehicleStatus.IN_SHOP

    db.commit()
    db.refresh(db_log)
    return db_log


@router.put("/{log_id}", response_model=MaintenanceResponse)
def update_maintenance_log(
    log_id: int,
    maintenance: MaintenanceUpdate,
    db: Session = Depends(get_db),
):
    """
    Update a maintenance log.
    
    Note: Cannot update a completed maintenance log.
    """
    db_log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    if db_log.is_completed:
        raise HTTPException(
            status_code=400,
            detail="Cannot update a completed maintenance log"
        )

    update_data = maintenance.model_dump(exclude_unset=True)

    # Recalculate total cost if parts/labor cost changed
    parts_cost = update_data.get("parts_cost", db_log.parts_cost)
    labor_cost = update_data.get("labor_cost", db_log.labor_cost)
    update_data["total_cost"] = parts_cost + labor_cost

    for key, value in update_data.items():
        setattr(db_log, key, value)

    db.commit()
    db.refresh(db_log)
    return db_log


@router.post("/{log_id}/complete", response_model=MaintenanceResponse)
def complete_maintenance(
    log_id: int,
    complete_data: MaintenanceComplete,
    db: Session = Depends(get_db),
):
    """
    Mark maintenance as completed and release vehicle.
    
    Business Logic:
    - Sets is_completed to True
    - Records completion_date
    - Changes vehicle status back to "AVAILABLE"
    - Vehicle becomes visible to dispatcher again
    """
    db_log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    if db_log.is_completed:
        raise HTTPException(status_code=400, detail="Maintenance is already completed")

    # Get vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == db_log.vehicle_id).first()

    # Update maintenance log
    db_log.is_completed = True
    db_log.completion_date = complete_data.completion_date or datetime.now(timezone.utc)
    if complete_data.notes:
        db_log.notes = complete_data.notes

    # Release vehicle - set status back to AVAILABLE
    vehicle.status = VehicleStatus.AVAILABLE

    db.commit()
    db.refresh(db_log)
    return db_log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance_log(log_id: int, db: Session = Depends(get_db)):
    """
    Delete a maintenance log.
    
    Business Logic:
    - If maintenance was not completed, release vehicle back to AVAILABLE
    """
    db_log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    # If not completed, release vehicle
    if not db_log.is_completed:
        vehicle = db.query(Vehicle).filter(Vehicle.id == db_log.vehicle_id).first()
        if vehicle and vehicle.status == VehicleStatus.IN_SHOP:
            vehicle.status = VehicleStatus.AVAILABLE

    db.delete(db_log)
    db.commit()


@router.get("/vehicle/{vehicle_id}/history", response_model=List[MaintenanceResponse])
def get_vehicle_maintenance_history(
    vehicle_id: int,
    db: Session = Depends(get_db),
):
    """Get complete maintenance history for a specific vehicle."""
    # Validate vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return db.query(MaintenanceLog).filter(
        MaintenanceLog.vehicle_id == vehicle_id
    ).order_by(MaintenanceLog.service_date.desc()).all()


@router.get("/pending", response_model=List[MaintenanceResponse])
def get_pending_maintenance(db: Session = Depends(get_db)):
    """Get all maintenance logs that are not yet completed (vehicles in shop)."""
    return db.query(MaintenanceLog).filter(
        MaintenanceLog.is_completed == False
    ).order_by(MaintenanceLog.service_date.asc()).all()
