from enum import Enum as PyEnum

class UserRole(str, PyEnum):
    MANAGER = "Manager"
    DISPATCHER = "Dispatcher"
    SAFETY_OFFICER = "Safety Officer"
    FINANCIAL_ANALYST = "Financial Analyst"

class VehicleType(str, PyEnum):
    TRUCK = "Truck"
    VAN = "Van"
    BIKE = "Bike"

class FuelType(str, PyEnum):
    PETROL = "Petrol"
    DIESEL = "Diesel"
    ELECTRIC = "Electric"

class VehicleStatus(str, PyEnum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    OUT_OF_SERVICE = "Out of Service"

class DriverStatus(str, PyEnum):
    ON_DUTY = "On Duty"
    # ON_TRIP = "On Trip"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"

class TripStatus(str, PyEnum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
