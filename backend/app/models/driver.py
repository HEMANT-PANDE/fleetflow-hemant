from sqlalchemy import Column, Integer, String, Float, Enum, Date
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import DriverStatus

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)  # e.g., 'Van', 'Truck'
    license_expiry_date = Column(Date, nullable=False)
    
    # Page 7 metrics
    performance_score = Column(Float, default=100.0)  # Safety Score
    trip_completion_rate = Column(Float, default=100.0)
    
    status = Column(
        Enum(DriverStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=DriverStatus.ON_DUTY
    )

    # Relationships
    trips = relationship("Trip", back_populates="driver")
