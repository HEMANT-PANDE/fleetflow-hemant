from sqlalchemy import Column, Integer, String, Float, Date, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from .enums import DriverStatus

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    license_category = Column(String, nullable=False)
    license_expiry_date = Column(Date, nullable=False)

    performance_score = Column(Float, default=100.0)
    trip_completion_rate = Column(Float, default=100.0)

    status = Column(
        Enum(
            DriverStatus,
            values_callable=lambda obj: [e.value for e in obj],  # 🔥 EXACT SAME FIX
            name="driver_status"
        ),
        default=DriverStatus.ON_DUTY,
    )

    trips = relationship("Trip", back_populates="driver")