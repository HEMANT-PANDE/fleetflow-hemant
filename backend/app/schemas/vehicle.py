from pydantic import BaseModel, ConfigDict
from app.models.enums import VehicleType, VehicleStatus, FuelType
from typing import Optional

class VehicleBase(BaseModel):
    name: str
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: str
    max_capacity: float
    type: VehicleType
    fuel_type: Optional[FuelType] = FuelType.PETROL
    purchase_price: Optional[float] = 0.0
    current_value: Optional[float] = 0.0

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int
    odometer: float
    status: VehicleStatus

    model_config = ConfigDict(from_attributes=True)
