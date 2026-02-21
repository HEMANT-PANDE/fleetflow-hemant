from enum import Enum as PyEnum

class VehicleType(PyEnum):
    TRUCK = "Truck"
    VAN = "Van"
    BIKE = "Bike"

class VehicleStatus(PyEnum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    OUT_OF_SERVICE = "Out of Service"