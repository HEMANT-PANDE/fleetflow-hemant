from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.enums import MaintenanceType


class MaintenanceBase(BaseModel):
    """Base schema for maintenance log."""
    vehicle_id: int
    maintenance_type: MaintenanceType
    description: str = Field(..., min_length=1)
    service_provider: Optional[str] = None
    service_date: datetime


class MaintenanceCreate(MaintenanceBase):
    """Schema for creating a maintenance log."""
    parts_cost: float = Field(default=0, ge=0)
    labor_cost: float = Field(default=0, ge=0)
    notes: Optional[str] = None


class MaintenanceUpdate(BaseModel):
    """Schema for updating a maintenance log."""
    maintenance_type: Optional[MaintenanceType] = None
    description: Optional[str] = Field(None, min_length=1)
    service_provider: Optional[str] = None
    parts_cost: Optional[float] = Field(None, ge=0)
    labor_cost: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class MaintenanceComplete(BaseModel):
    """Schema for completing a maintenance log."""
    completion_date: Optional[datetime] = None
    notes: Optional[str] = None


class MaintenanceResponse(MaintenanceBase):
    """Schema for maintenance log response."""
    id: int
    parts_cost: float
    labor_cost: float
    total_cost: float
    completion_date: Optional[datetime]
    is_completed: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
