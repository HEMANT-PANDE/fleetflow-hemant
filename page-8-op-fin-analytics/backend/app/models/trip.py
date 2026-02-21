from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import TripStatus


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_name = Column(String(200))
    
    # Trip details
    start_location = Column(String(500))
    end_location = Column(String(500))
    distance_km = Column(Float, default=0.0)
    
    # Timing
    scheduled_start = Column(DateTime)
    scheduled_end = Column(DateTime)
    actual_start = Column(DateTime)
    actual_end = Column(DateTime)
    
    status = Column(Enum(TripStatus), default=TripStatus.SCHEDULED)
    
    # Cost tracking
    trip_cost = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
