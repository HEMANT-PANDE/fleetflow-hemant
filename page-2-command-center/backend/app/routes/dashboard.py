from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.enums import VehicleStatus, VehicleType, TripStatus
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    vehicle_type: Optional[VehicleType] = Query(None, description="Filter by vehicle type"),
    db: Session = Depends(get_db)
):
    # Base queries allowing for optional filtering
    vehicle_query = db.query(Vehicle)
    trip_query = db.query(Trip)

    if vehicle_type:
        vehicle_query = vehicle_query.filter(Vehicle.type == vehicle_type)
        # Note: Filtering trips by vehicle_type requires a join
        trip_query = trip_query.join(Vehicle).filter(Vehicle.type == vehicle_type)

    # 1. Active Fleet: vehicles currently "On Trip"
    active_fleet = vehicle_query.filter(Vehicle.status == VehicleStatus.ON_TRIP).count()

    # 2. Maintenance Alerts: vehicles marked "In Shop"
    maintenance_alerts = vehicle_query.filter(Vehicle.status == VehicleStatus.IN_SHOP).count()

    # 3. Utilization Rate: % of fleet assigned vs. idle
    # "Assigned" could mean ON_TRIP. "Idle" could mean AVAILABLE. 
    # Let's define it as: (On Trip) / (Available + On Trip) * 100
    # or (On Trip) / Total Active Vehicles
    total_active_vehicles = vehicle_query.filter(
        Vehicle.status.in_([VehicleStatus.AVAILABLE, VehicleStatus.ON_TRIP])
    ).count()

    utilization_rate_percent = 0.0
    if total_active_vehicles > 0:
        utilization_rate_percent = (active_fleet / total_active_vehicles) * 100.0

    # 4. Pending Cargo: Shipments waiting for assignment (draft trips)
    pending_cargo = trip_query.filter(Trip.status == TripStatus.DRAFT).count()

    return DashboardStats(
        active_fleet=active_fleet,
        maintenance_alerts=maintenance_alerts,
        utilization_rate_percent=round(utilization_rate_percent, 2),
        pending_cargo=pending_cargo
    )
