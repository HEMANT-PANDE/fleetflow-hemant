from enum import Enum


class VehicleStatus(str, Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    IN_SHOP = "in_shop"
    OUT_OF_SERVICE = "out_of_service"


class VehicleType(str, Enum):
    SEDAN = "sedan"
    SUV = "suv"
    TRUCK = "truck"
    VAN = "van"
    MOTORCYCLE = "motorcycle"


class FuelType(str, Enum):
    PETROL = "petrol"
    DIESEL = "diesel"
    ELECTRIC = "electric"
    HYBRID = "hybrid"
    CNG = "cng"


class TripStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ExpenseCategory(str, Enum):
    FUEL = "fuel"
    MAINTENANCE = "maintenance"
    INSURANCE = "insurance"
    TOLL = "toll"
    PARKING = "parking"
    OTHER = "other"
