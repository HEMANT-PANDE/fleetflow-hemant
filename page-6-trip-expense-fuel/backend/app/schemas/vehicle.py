from pydantic import BaseModel # type: ignore
from typing import Optional
from app.models.enums import VehicleType, VehicleStatus # type: ignore

class VehicleBase(BaseModel):
    name: str  # Name/Model
    license_plate: str
    max_capacity: float
    type: VehicleType
    odometer: Optional[float] = 0.0
    status: Optional[VehicleStatus] = VehicleStatus.AVAILABLE

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True
