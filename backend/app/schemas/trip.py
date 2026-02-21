from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.models.enums import TripStatus
from datetime import datetime

class TripBase(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    start_location: Optional[str] = None
    end_location: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripResponse(TripBase):
    id: int
    status: TripStatus
    final_odometer: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TripComplete(BaseModel):
    final_odometer: float
