from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import VehicleStatus, VehicleType, FuelType


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(50), unique=True, nullable=False)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    vehicle_type = Column(Enum(VehicleType), nullable=False)
    fuel_type = Column(Enum(FuelType), default=FuelType.PETROL)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    
    # Financial data for ROI calculation
    purchase_price = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)
    
    # Odometer for fuel efficiency
    odometer_reading = Column(Float, default=0.0)  # in km
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trips = relationship("Trip", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")
