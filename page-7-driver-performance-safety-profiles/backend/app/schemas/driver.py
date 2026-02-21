from pydantic import BaseModel
from datetime import date
from enum import Enum

class DriverStatus(str, Enum):
    ON_DUTY = "On Duty"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"


# 🔹 Create Driver Schema
class DriverCreate(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date


# 🔹 Response Schema
class DriverResponse(BaseModel):
    id: int
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    performance_score: float
    trip_completion_rate: float
    status: DriverStatus
    license_valid: bool

    class Config:
        from_attributes = True


# 🔹 Toggle Schema
class StatusUpdate(BaseModel):
    status: DriverStatus