import enum


class VehicleStatus(str, enum.Enum):
    """Vehicle status options."""
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    IN_SHOP = "in_shop"
    OUT_OF_SERVICE = "out_of_service"


class VehicleType(str, enum.Enum):
    """Vehicle type categories."""
    TRUCK = "truck"
    VAN = "van"
    BIKE = "bike"


class MaintenanceType(str, enum.Enum):
    """Maintenance type categories."""
    PREVENTIVE = "preventive"
    REACTIVE = "reactive"
    SCHEDULED = "scheduled"
