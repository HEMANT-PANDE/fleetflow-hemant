from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
from app.models.enums import FuelType

# Maintenance
class MaintenanceLogBase(BaseModel):
    vehicle_id: int
    service_type: str
    description: Optional[str] = None
    cost: float
    date: date

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogResponse(MaintenanceLogBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Expenses
class ExpenseLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    expense_type: str
    cost: float
    date: date

class ExpenseLogCreate(ExpenseLogBase):
    pass

class ExpenseLogResponse(ExpenseLogBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Fuel
class FuelLogBase(BaseModel):
    vehicle_id: int
    fuel_type: Optional[FuelType] = None
    quantity_liters: float
    total_cost: float
    date: date
    odometer_reading: Optional[float] = None

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogResponse(FuelLogBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
