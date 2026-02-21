from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.responses import Response
import csv
import io

from app.database import get_db
from app.models.finance import MaintenanceLog, FuelLog, ExpenseLog
from app.models.vehicle import Vehicle
from app.models.trip import Trip

router = APIRouter()

@router.get("/roi")
def get_fleet_roi(db: Session = Depends(get_db)):
    # Very simplified ROI formula calculation purely as an example backend logic 
    # Formula: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    # Assuming standard Acquisition Cost of 50000 for calculation purposes per vehicle,
    # and standard Revenue of 1000 per trip.
    
    total_maintenance = db.query(func.sum(MaintenanceLog.cost)).scalar() or 0.0
    total_fuel = db.query(func.sum(FuelLog.total_cost)).scalar() or 0.0
    total_expenses = db.query(func.sum(ExpenseLog.cost)).scalar() or 0.0
    
    total_trips = db.query(Trip).filter(Trip.status == "COMPLETED").count()
    total_revenue = total_trips * 1000.0
    
    total_vehicles = db.query(Vehicle).count()
    if total_vehicles == 0:
        return {"roi_percentage": 0.0}
        
    total_acquisition_cost = total_vehicles * 50000.0  # mock value
    
    roi = (total_revenue - (total_maintenance + total_fuel + total_expenses)) / total_acquisition_cost
    return {"roi_percentage": round(roi * 100, 2)}


@router.get("/fuel-efficiency")
def get_fuel_efficiency(db: Session = Depends(get_db)):
    # Fuel Efficiency: km / L. 
    # Example approach: aggregate total fuel consumed / total km traveled
    
    # Get total fuel liters consumed
    total_liters = db.query(func.sum(FuelLog.quantity_liters)).scalar() or 0.0
    
    if total_liters == 0:
        return {"fuel_efficiency_km_per_l": 0.0}
        
    # Get total distance from completed trips where final odometer exists
    # Simplified mock approach: sum of (final_odometer)
    # Ideally should be difference between trip start and end odometers, 
    # or just aggregated from final_odometer entries if starting at 0
    total_dist = db.query(func.sum(Trip.final_odometer)).filter(Trip.final_odometer.isnot(None)).scalar() or 0.0
    
    if total_dist == 0:
        return {"fuel_efficiency_km_per_l": 0.0}
        
    efficiency = total_dist / total_liters
    return {"fuel_efficiency_km_per_l": round(efficiency, 2)}


@router.get("/export")
def export_monthly_report(db: Session = Depends(get_db)):
    # Export One-click CSV/PDF for monthly payroll and health audits.
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow(["Record Type", "Vehicle ID", "Cost/Value", "Date", "Details"])
    
    # Maintenance logs
    maintenance_logs = db.query(MaintenanceLog).all()
    for log in maintenance_logs:
        writer.writerow(["Maintenance", log.vehicle_id, log.cost, log.date.isoformat(), log.service_type])
        
    # Fuel logs
    fuel_logs = db.query(FuelLog).all()
    for log in fuel_logs:
        writer.writerow(["Fuel", log.vehicle_id, log.total_cost, log.date.isoformat(), f"{log.quantity_liters}L"])
        
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=monthly_fleet_report.csv"}
    )
