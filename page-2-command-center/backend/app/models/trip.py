from sqlalchemy import Column, Integer, Float, ForeignKey, Enum, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import TripStatus

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, nullable=False) # Simplified, as Driver model isn't strictly needed for stats
    cargo_weight = Column(Float, nullable=False)
    status = Column(
        Enum(
            TripStatus,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=TripStatus.DRAFT
    )
    start_location = Column(String, nullable=True)
    end_location = Column(String, nullable=True)
    final_odometer = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", back_populates="trips")
