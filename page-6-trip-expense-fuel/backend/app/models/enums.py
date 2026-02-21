from enum import Enum as PyEnum

class UserRole(PyEnum):
    MANAGER = "Manager"
    DISPATCHER = "Dispatcher"
    SAFETY_OFFICER = "Safety Officer"
    FINANCIAL_ANALYST = "Financial Analyst"

class VehicleType(PyEnum):
    TRUCK = "Truck"
    VAN = "Van"
    BIKE = "Bike"

class VehicleStatus(PyEnum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    OUT_OF_SERVICE = "Out of Service"

class DriverStatus(PyEnum):
    ON_DUTY = "On Duty"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"

class TripStatus(PyEnum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
