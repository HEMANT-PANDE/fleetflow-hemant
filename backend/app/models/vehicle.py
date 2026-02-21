from sqlalchemy import Column, Integer, String, Float, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import VehicleType, VehicleStatus, FuelType

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    # Core identification
    name = Column(String, nullable=False)  # Mapped from Page 3/4 (Usually Make+Model)
    make = Column(String(100), nullable=True) # Page 8 specifies Make exactly
    model = Column(String(100), nullable=True) # Page 8 specifies Model exactly
    year = Column(Integer, nullable=True)

    # License and Capacity
    license_plate = Column(String(50), unique=True, index=True, nullable=False) # Maps to Page 8 registration_number
    max_capacity = Column(Float, nullable=False) # Essential for Page 4 dispatch validation

    # Tracking metrics
    odometer = Column(Float, default=0.0)
    
    # Economics (Page 8 analytics)
    purchase_price = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)

    # Types and Statuses
    type = Column(
        Enum(VehicleType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False
    )
    fuel_type = Column(
        Enum(FuelType, values_callable=lambda obj: [e.value for e in obj]),
        default=FuelType.PETROL
    )
    status = Column(
        Enum(VehicleStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=VehicleStatus.AVAILABLE
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    expense_logs = relationship("ExpenseLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
