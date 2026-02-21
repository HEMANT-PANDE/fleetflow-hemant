from enum import Enum

class VehicleType(str, Enum):
    TRUCK = "Truck"
    VAN = "Van"
    BIKE = "Bike"

class VehicleStatus(str, Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    OUT_OF_SERVICE = "Out of Service"

class TripStatus(str, Enum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
