from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# Fuel Efficiency Metrics
class FuelEfficiencyMetric(BaseModel):
    vehicle_id: int
    registration_number: str
    make: str
    model: str
    total_distance_km: float
    total_fuel_liters: float
    fuel_efficiency_km_per_liter: float
    total_fuel_cost: float
    cost_per_km: float


class FleetFuelEfficiencyReport(BaseModel):
    report_date: datetime
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    total_vehicles: int
    total_distance_km: float
    total_fuel_liters: float
    average_efficiency_km_per_liter: float
    total_fuel_cost: float
    vehicles: List[FuelEfficiencyMetric]


# Vehicle ROI Metrics
class VehicleROIMetric(BaseModel):
    vehicle_id: int
    registration_number: str
    make: str
    model: str
    year: int
    purchase_price: float
    current_value: float
    depreciation: float
    total_revenue: float
    total_expenses: float
    net_profit: float
    roi_percentage: float
    cost_per_km: float
    revenue_per_km: float


class FleetROIReport(BaseModel):
    report_date: datetime
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    total_vehicles: int
    total_purchase_value: float
    total_current_value: float
    total_depreciation: float
    total_revenue: float
    total_expenses: float
    fleet_net_profit: float
    fleet_roi_percentage: float
    vehicles: List[VehicleROIMetric]


# Expense Summary
class ExpenseSummary(BaseModel):
    category: str
    total_amount: float
    count: int
    percentage_of_total: float


class ExpenseReport(BaseModel):
    report_date: datetime
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    total_expenses: float
    expense_by_category: List[ExpenseSummary]


# Trip Analytics
class TripSummary(BaseModel):
    total_trips: int
    completed_trips: int
    cancelled_trips: int
    total_distance_km: float
    total_revenue: float
    total_cost: float
    average_trip_distance_km: float
    average_trip_revenue: float


# Dashboard Summary
class DashboardSummary(BaseModel):
    report_date: datetime
    total_vehicles: int
    vehicles_available: int
    vehicles_in_use: int
    vehicles_in_shop: int
    total_trips_this_month: int
    total_distance_this_month_km: float
    total_fuel_cost_this_month: float
    total_revenue_this_month: float
    total_expenses_this_month: float
    average_fleet_efficiency_km_per_liter: float


# Export Request
class ExportRequest(BaseModel):
    report_type: str  # "fuel_efficiency", "roi", "expenses", "trips"
    format: str  # "csv", "pdf"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    vehicle_ids: Optional[List[int]] = None


class ExportResponse(BaseModel):
    filename: str
    content_type: str
    download_url: str
