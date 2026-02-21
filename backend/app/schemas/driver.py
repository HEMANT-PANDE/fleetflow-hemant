from pydantic import BaseModel, ConfigDict
from app.models.enums import DriverStatus
from datetime import date

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date

class DriverCreate(DriverBase):
    pass

class DriverResponse(DriverBase):
    id: int
    performance_score: float
    trip_completion_rate: float
    status: DriverStatus

    model_config = ConfigDict(from_attributes=True)
