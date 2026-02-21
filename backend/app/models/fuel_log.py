from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    
    # Fuel data
    fuel_amount_liters = Column(Float, nullable=False)
    fuel_cost = Column(Float, nullable=False)
    price_per_liter = Column(Float)
    
    # Odometer readings for efficiency calculation
    odometer_at_fill = Column(Float, nullable=False)
    
    fill_date = Column(DateTime, default=datetime.utcnow)
    station_name = Column(String(200))
    notes = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_logs")
