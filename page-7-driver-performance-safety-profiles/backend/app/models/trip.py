from sqlalchemy import Column, Integer, Float, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from .enums import TripStatus

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    cargo_weight = Column(Float, nullable=False)
    status = Column(
        Enum(
            TripStatus,
            values_callable=lambda obj: [e.value for e in obj],  # 🔥 SAME FIX
            name="trip_status"
        ),
        default=TripStatus.DRAFT,
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    driver = relationship("Driver", back_populates="trips")