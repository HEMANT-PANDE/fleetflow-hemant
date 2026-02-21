from pydantic import BaseModel, Field
from app.models.enums import VehicleType, VehicleStatus

class VehicleCreate(BaseModel):
    name: str
    license_plate: str
    max_capacity: float = Field(gt=0)
    odometer: float = Field(ge=0)
    type: VehicleType

class VehicleResponse(BaseModel):
    id: int
    name: str
    license_plate: str
    max_capacity: float
    odometer: float
    type: VehicleType
    status: VehicleStatus

    class Config:
        orm_mode = True