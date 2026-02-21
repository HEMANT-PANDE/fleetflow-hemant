from enum import Enum as PyEnum

class DriverStatus(PyEnum):
    ON_DUTY = "On Duty"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"

class TripStatus(PyEnum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"