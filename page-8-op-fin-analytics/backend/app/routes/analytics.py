from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional, List
from datetime import datetime, date, timedelta
import csv
import io

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.fuel_log import FuelLog
from app.models.expense import Expense
from app.models.enums import VehicleStatus, TripStatus, ExpenseCategory
from app.schemas.analytics import (
    FuelEfficiencyMetric,
    FleetFuelEfficiencyReport,
    VehicleROIMetric,
    FleetROIReport,
    ExpenseSummary,
    ExpenseReport,
    TripSummary,
    DashboardSummary,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Reports"])


# ==================== DASHBOARD ====================

@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get overall fleet dashboard summary"""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Vehicle counts
    total_vehicles = db.query(Vehicle).count()
    vehicles_available = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.AVAILABLE).count()
    vehicles_in_use = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.IN_USE).count()
    vehicles_in_shop = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.IN_SHOP).count()
    
    # Trip stats this month
    trips_this_month = db.query(Trip).filter(Trip.created_at >= month_start).all()
    total_trips = len(trips_this_month)
    total_distance = sum(t.distance_km or 0 for t in trips_this_month)
    total_revenue = sum(t.revenue or 0 for t in trips_this_month)
    
    # Fuel costs this month
    fuel_logs = db.query(FuelLog).filter(FuelLog.fill_date >= month_start).all()
    total_fuel_cost = sum(f.fuel_cost or 0 for f in fuel_logs)
    total_fuel_liters = sum(f.fuel_amount_liters or 0 for f in fuel_logs)
    
    # Expenses this month
    expenses = db.query(Expense).filter(Expense.expense_date >= month_start).all()
    total_expenses = sum(e.amount or 0 for e in expenses) + total_fuel_cost
    
    # Average fuel efficiency
    avg_efficiency = total_distance / total_fuel_liters if total_fuel_liters > 0 else 0
    
    return DashboardSummary(
        report_date=now,
        total_vehicles=total_vehicles,
        vehicles_available=vehicles_available,
        vehicles_in_use=vehicles_in_use,
        vehicles_in_shop=vehicles_in_shop,
        total_trips_this_month=total_trips,
        total_distance_this_month_km=round(total_distance, 2),
        total_fuel_cost_this_month=round(total_fuel_cost, 2),
        total_revenue_this_month=round(total_revenue, 2),
        total_expenses_this_month=round(total_expenses, 2),
        average_fleet_efficiency_km_per_liter=round(avg_efficiency, 2)
    )


# ==================== FUEL EFFICIENCY ====================

@router.get("/fuel-efficiency", response_model=FleetFuelEfficiencyReport)
def get_fuel_efficiency_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get fuel efficiency metrics (km/L) for fleet or specific vehicle"""
    
    # Build fuel log query
    query = db.query(FuelLog)
    if start_date:
        query = query.filter(FuelLog.fill_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(FuelLog.fill_date <= datetime.combine(end_date, datetime.max.time()))
    if vehicle_id:
        query = query.filter(FuelLog.vehicle_id == vehicle_id)
    
    fuel_logs = query.all()
    
    # Group by vehicle
    vehicle_data = {}
    for log in fuel_logs:
        vid = log.vehicle_id
        if vid not in vehicle_data:
            vehicle_data[vid] = {
                "fuel_liters": 0,
                "fuel_cost": 0,
                "logs": []
            }
        vehicle_data[vid]["fuel_liters"] += log.fuel_amount_liters or 0
        vehicle_data[vid]["fuel_cost"] += log.fuel_cost or 0
        vehicle_data[vid]["logs"].append(log)
    
    # Build trip query for distance
    trip_query = db.query(Trip).filter(Trip.status == TripStatus.COMPLETED)
    if start_date:
        trip_query = trip_query.filter(Trip.actual_end >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        trip_query = trip_query.filter(Trip.actual_end <= datetime.combine(end_date, datetime.max.time()))
    if vehicle_id:
        trip_query = trip_query.filter(Trip.vehicle_id == vehicle_id)
    
    trips = trip_query.all()
    
    # Add distance to vehicle data
    for trip in trips:
        vid = trip.vehicle_id
        if vid not in vehicle_data:
            vehicle_data[vid] = {"fuel_liters": 0, "fuel_cost": 0, "logs": []}
        if "distance" not in vehicle_data[vid]:
            vehicle_data[vid]["distance"] = 0
        vehicle_data[vid]["distance"] += trip.distance_km or 0
    
    # Calculate metrics for each vehicle
    vehicle_metrics = []
    total_distance = 0
    total_fuel = 0
    total_cost = 0
    
    for vid, data in vehicle_data.items():
        vehicle = db.query(Vehicle).filter(Vehicle.id == vid).first()
        if not vehicle:
            continue
        
        distance = data.get("distance", 0)
        fuel = data["fuel_liters"]
        cost = data["fuel_cost"]
        
        efficiency = distance / fuel if fuel > 0 else 0
        cost_per_km = cost / distance if distance > 0 else 0
        
        total_distance += distance
        total_fuel += fuel
        total_cost += cost
        
        vehicle_metrics.append(FuelEfficiencyMetric(
            vehicle_id=vid,
            registration_number=vehicle.registration_number,
            make=vehicle.make,
            model=vehicle.model,
            total_distance_km=round(distance, 2),
            total_fuel_liters=round(fuel, 2),
            fuel_efficiency_km_per_liter=round(efficiency, 2),
            total_fuel_cost=round(cost, 2),
            cost_per_km=round(cost_per_km, 2)
        ))
    
    avg_efficiency = total_distance / total_fuel if total_fuel > 0 else 0
    
    return FleetFuelEfficiencyReport(
        report_date=datetime.utcnow(),
        period_start=start_date,
        period_end=end_date,
        total_vehicles=len(vehicle_metrics),
        total_distance_km=round(total_distance, 2),
        total_fuel_liters=round(total_fuel, 2),
        average_efficiency_km_per_liter=round(avg_efficiency, 2),
        total_fuel_cost=round(total_cost, 2),
        vehicles=vehicle_metrics
    )


# ==================== VEHICLE ROI ====================

@router.get("/vehicle-roi", response_model=FleetROIReport)
def get_vehicle_roi_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get Vehicle ROI (Return on Investment) metrics"""
    
    # Get vehicles
    vehicle_query = db.query(Vehicle)
    if vehicle_id:
        vehicle_query = vehicle_query.filter(Vehicle.id == vehicle_id)
    vehicles = vehicle_query.all()
    
    vehicle_metrics = []
    total_purchase = 0
    total_current = 0
    total_revenue = 0
    total_expenses = 0
    
    for vehicle in vehicles:
        # Get trips for revenue
        trip_query = db.query(Trip).filter(Trip.vehicle_id == vehicle.id, Trip.status == TripStatus.COMPLETED)
        if start_date:
            trip_query = trip_query.filter(Trip.actual_end >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            trip_query = trip_query.filter(Trip.actual_end <= datetime.combine(end_date, datetime.max.time()))
        trips = trip_query.all()
        
        revenue = sum(t.revenue or 0 for t in trips)
        trip_costs = sum(t.trip_cost or 0 for t in trips)
        distance = sum(t.distance_km or 0 for t in trips)
        
        # Get expenses
        expense_query = db.query(Expense).filter(Expense.vehicle_id == vehicle.id)
        if start_date:
            expense_query = expense_query.filter(Expense.expense_date >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            expense_query = expense_query.filter(Expense.expense_date <= datetime.combine(end_date, datetime.max.time()))
        expenses = expense_query.all()
        
        expense_total = sum(e.amount or 0 for e in expenses) + trip_costs
        
        # Get fuel costs
        fuel_query = db.query(FuelLog).filter(FuelLog.vehicle_id == vehicle.id)
        if start_date:
            fuel_query = fuel_query.filter(FuelLog.fill_date >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            fuel_query = fuel_query.filter(FuelLog.fill_date <= datetime.combine(end_date, datetime.max.time()))
        fuel_logs = fuel_query.all()
        
        fuel_cost = sum(f.fuel_cost or 0 for f in fuel_logs)
        expense_total += fuel_cost
        
        # Calculate metrics
        purchase_price = vehicle.purchase_price or 0
        current_value = vehicle.current_value or 0
        depreciation = purchase_price - current_value
        net_profit = revenue - expense_total
        
        # ROI = (Net Profit / Total Investment) * 100
        roi = (net_profit / purchase_price * 100) if purchase_price > 0 else 0
        
        cost_per_km = expense_total / distance if distance > 0 else 0
        revenue_per_km = revenue / distance if distance > 0 else 0
        
        total_purchase += purchase_price
        total_current += current_value
        total_revenue += revenue
        total_expenses += expense_total
        
        vehicle_metrics.append(VehicleROIMetric(
            vehicle_id=vehicle.id,
            registration_number=vehicle.registration_number,
            make=vehicle.make,
            model=vehicle.model,
            year=vehicle.year,
            purchase_price=round(purchase_price, 2),
            current_value=round(current_value, 2),
            depreciation=round(depreciation, 2),
            total_revenue=round(revenue, 2),
            total_expenses=round(expense_total, 2),
            net_profit=round(net_profit, 2),
            roi_percentage=round(roi, 2),
            cost_per_km=round(cost_per_km, 2),
            revenue_per_km=round(revenue_per_km, 2)
        ))
    
    total_depreciation = total_purchase - total_current
    fleet_profit = total_revenue - total_expenses
    fleet_roi = (fleet_profit / total_purchase * 100) if total_purchase > 0 else 0
    
    return FleetROIReport(
        report_date=datetime.utcnow(),
        period_start=start_date,
        period_end=end_date,
        total_vehicles=len(vehicle_metrics),
        total_purchase_value=round(total_purchase, 2),
        total_current_value=round(total_current, 2),
        total_depreciation=round(total_depreciation, 2),
        total_revenue=round(total_revenue, 2),
        total_expenses=round(total_expenses, 2),
        fleet_net_profit=round(fleet_profit, 2),
        fleet_roi_percentage=round(fleet_roi, 2),
        vehicles=vehicle_metrics
    )


# ==================== EXPENSE REPORT ====================

@router.get("/expenses", response_model=ExpenseReport)
def get_expense_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get expense breakdown by category"""
    
    query = db.query(Expense)
    if start_date:
        query = query.filter(Expense.expense_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(Expense.expense_date <= datetime.combine(end_date, datetime.max.time()))
    if vehicle_id:
        query = query.filter(Expense.vehicle_id == vehicle_id)
    
    expenses = query.all()
    
    # Also include fuel costs
    fuel_query = db.query(FuelLog)
    if start_date:
        fuel_query = fuel_query.filter(FuelLog.fill_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        fuel_query = fuel_query.filter(FuelLog.fill_date <= datetime.combine(end_date, datetime.max.time()))
    if vehicle_id:
        fuel_query = fuel_query.filter(FuelLog.vehicle_id == vehicle_id)
    
    fuel_logs = fuel_query.all()
    fuel_total = sum(f.fuel_cost or 0 for f in fuel_logs)
    
    # Group by category
    category_totals = {}
    for expense in expenses:
        cat = expense.category.value
        if cat not in category_totals:
            category_totals[cat] = {"total": 0, "count": 0}
        category_totals[cat]["total"] += expense.amount or 0
        category_totals[cat]["count"] += 1
    
    # Add fuel as a category
    if fuel_total > 0:
        category_totals["fuel"] = {"total": fuel_total, "count": len(fuel_logs)}
    
    total_expenses = sum(c["total"] for c in category_totals.values())
    
    expense_summaries = []
    for cat, data in category_totals.items():
        percentage = (data["total"] / total_expenses * 100) if total_expenses > 0 else 0
        expense_summaries.append(ExpenseSummary(
            category=cat,
            total_amount=round(data["total"], 2),
            count=data["count"],
            percentage_of_total=round(percentage, 2)
        ))
    
    return ExpenseReport(
        report_date=datetime.utcnow(),
        period_start=start_date,
        period_end=end_date,
        total_expenses=round(total_expenses, 2),
        expense_by_category=expense_summaries
    )


# ==================== TRIP ANALYTICS ====================

@router.get("/trips", response_model=TripSummary)
def get_trip_analytics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get trip analytics summary"""
    
    query = db.query(Trip)
    if start_date:
        query = query.filter(Trip.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(Trip.created_at <= datetime.combine(end_date, datetime.max.time()))
    if vehicle_id:
        query = query.filter(Trip.vehicle_id == vehicle_id)
    
    trips = query.all()
    
    total_trips = len(trips)
    completed_trips = len([t for t in trips if t.status == TripStatus.COMPLETED])
    cancelled_trips = len([t for t in trips if t.status == TripStatus.CANCELLED])
    
    completed = [t for t in trips if t.status == TripStatus.COMPLETED]
    total_distance = sum(t.distance_km or 0 for t in completed)
    total_revenue = sum(t.revenue or 0 for t in completed)
    total_cost = sum(t.trip_cost or 0 for t in completed)
    
    avg_distance = total_distance / len(completed) if completed else 0
    avg_revenue = total_revenue / len(completed) if completed else 0
    
    return TripSummary(
        total_trips=total_trips,
        completed_trips=completed_trips,
        cancelled_trips=cancelled_trips,
        total_distance_km=round(total_distance, 2),
        total_revenue=round(total_revenue, 2),
        total_cost=round(total_cost, 2),
        average_trip_distance_km=round(avg_distance, 2),
        average_trip_revenue=round(avg_revenue, 2)
    )


# ==================== CSV EXPORTS ====================

@router.get("/export/fuel-efficiency/csv")
def export_fuel_efficiency_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Export fuel efficiency report as CSV"""
    
    report = get_fuel_efficiency_report(start_date, end_date, None, db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Vehicle ID", "Registration", "Make", "Model",
        "Distance (km)", "Fuel (L)", "Efficiency (km/L)",
        "Fuel Cost", "Cost per km"
    ])
    
    # Data rows
    for v in report.vehicles:
        writer.writerow([
            v.vehicle_id, v.registration_number, v.make, v.model,
            v.total_distance_km, v.total_fuel_liters, v.fuel_efficiency_km_per_liter,
            v.total_fuel_cost, v.cost_per_km
        ])
    
    # Summary row
    writer.writerow([])
    writer.writerow(["TOTAL", "", "", "",
        report.total_distance_km, report.total_fuel_liters,
        report.average_efficiency_km_per_liter, report.total_fuel_cost, ""
    ])
    
    output.seek(0)
    
    filename = f"fuel_efficiency_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/vehicle-roi/csv")
def export_vehicle_roi_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Export vehicle ROI report as CSV"""
    
    report = get_vehicle_roi_report(start_date, end_date, None, db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Vehicle ID", "Registration", "Make", "Model", "Year",
        "Purchase Price", "Current Value", "Depreciation",
        "Revenue", "Expenses", "Net Profit", "ROI %",
        "Cost/km", "Revenue/km"
    ])
    
    # Data rows
    for v in report.vehicles:
        writer.writerow([
            v.vehicle_id, v.registration_number, v.make, v.model, v.year,
            v.purchase_price, v.current_value, v.depreciation,
            v.total_revenue, v.total_expenses, v.net_profit, v.roi_percentage,
            v.cost_per_km, v.revenue_per_km
        ])
    
    # Summary row
    writer.writerow([])
    writer.writerow(["FLEET TOTAL", "", "", "", "",
        report.total_purchase_value, report.total_current_value, report.total_depreciation,
        report.total_revenue, report.total_expenses, report.fleet_net_profit,
        report.fleet_roi_percentage, "", ""
    ])
    
    output.seek(0)
    
    filename = f"vehicle_roi_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/expenses/csv")
def export_expenses_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Export expense report as CSV"""
    
    report = get_expense_report(start_date, end_date, None, db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Category", "Total Amount", "Count", "Percentage of Total"])
    
    # Data rows
    for e in report.expense_by_category:
        writer.writerow([e.category, e.total_amount, e.count, f"{e.percentage_of_total}%"])
    
    # Summary row
    writer.writerow([])
    writer.writerow(["TOTAL", report.total_expenses, "", "100%"])
    
    output.seek(0)
    
    filename = f"expense_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/trips/csv")
def export_trips_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Export detailed trip data as CSV for audits/payroll"""
    
    query = db.query(Trip)
    if start_date:
        query = query.filter(Trip.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(Trip.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    trips = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Trip ID", "Vehicle ID", "Driver Name",
        "Start Location", "End Location", "Distance (km)",
        "Scheduled Start", "Scheduled End", "Actual Start", "Actual End",
        "Status", "Trip Cost", "Revenue"
    ])
    
    # Data rows
    for t in trips:
        writer.writerow([
            t.id, t.vehicle_id, t.driver_name,
            t.start_location, t.end_location, t.distance_km,
            t.scheduled_start, t.scheduled_end, t.actual_start, t.actual_end,
            t.status.value if t.status else "", t.trip_cost, t.revenue
        ])
    
    output.seek(0)
    
    filename = f"trips_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
