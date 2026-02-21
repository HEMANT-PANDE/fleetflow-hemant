from pydantic import BaseModel, Field, model_validator # type: ignore
from typing import Optional
from datetime import date

class ExpenseLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    expense_type: str = Field(..., description="Type of expense, e.g., 'Fuel', 'Toll'")
    liters: Optional[float] = None
    cost: float = Field(..., gt=0, description="Cost must be greater than zero")
    date: date

class ExpenseLogCreate(ExpenseLogBase):
    @model_validator(mode='after')
    def validate_fuel_liters(self):
        # We need to explicitly check against None and then cast to float for comparison/linting
        if self.expense_type.lower() == 'fuel':
            if getattr(self, "liters", None) is None or float(self.liters or 0.0) <= 0:
                raise ValueError("Liters must be a positive value when expense type is Fuel")
        else:
            if getattr(self, "liters", None) is not None:
                raise ValueError("Liters should only be provided for Fuel expenses")
        return self

class ExpenseLogResponse(ExpenseLogBase):
    id: int

    class Config:
        from_attributes = True
