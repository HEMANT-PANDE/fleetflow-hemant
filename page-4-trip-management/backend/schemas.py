from pydantic import BaseModel, Field, root_validator
from typing import Optional, List
from datetime import date, datetime
from .models import VehicleType, VehicleStatus, DriverStatus, TripStatus, UserRole

class UserBase(BaseModel):
    email: str
    role: UserRole
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserSchema(UserBase):
    id: int
    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    name: str
    license_plate: str
    max_capacity: float
    type: VehicleType
    odometer: float = 0.0
    status: VehicleStatus = VehicleStatus.AVAILABLE

class VehicleCreate(VehicleBase):
    pass

class VehicleSchema(VehicleBase):
    id: int
    class Config:
        from_attributes = True

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    performance_score: float = 100.0
    trip_completion_rate: float = 100.0
    status: DriverStatus = DriverStatus.ON_DUTY

class DriverCreate(DriverBase):
    pass

class DriverSchema(DriverBase):
    id: int
    class Config:
        from_attributes = True

class TripBase(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    start_location: Optional[str] = None
    end_location: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripSchema(TripBase):
    id: int
    status: TripStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    final_odometer: Optional[float] = None
    class Config:
        from_attributes = True
