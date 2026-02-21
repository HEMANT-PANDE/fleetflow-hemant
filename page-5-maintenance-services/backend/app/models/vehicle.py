from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.enums import VehicleStatus, VehicleType


class Vehicle(Base):
    """Vehicle model for fleet asset management."""
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    license_plate = Column(String(20), unique=True, index=True, nullable=False)
    vehicle_type = Column(Enum(VehicleType), nullable=False)
    max_load_capacity = Column(Float, nullable=False)  # in kg
    current_odometer = Column(Float, default=0)  # in km
    status = Column(Enum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    region = Column(String(100))
    is_retired = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
