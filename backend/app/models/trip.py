from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import TripStatus

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    
    # Assignments
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    
    # Load and routing
    cargo_weight = Column(Float, nullable=False)
    start_location = Column(String, nullable=True) # Point A
    end_location = Column(String, nullable=True)   # Point B
    final_odometer = Column(Float, nullable=True)
    
    status = Column(
        Enum(TripStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=TripStatus.DRAFT
    )
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    expense_logs = relationship("ExpenseLog", back_populates="trip", cascade="all, delete-orphan")
