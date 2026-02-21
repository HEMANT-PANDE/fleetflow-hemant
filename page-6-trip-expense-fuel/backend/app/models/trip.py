from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.database import Base # type: ignore
from app.models.enums import TripStatus # type: ignore
from datetime import datetime

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float, nullable=False)
    status = Column(Enum(TripStatus, values_callable=lambda obj: [e.value for e in obj]), default=TripStatus.DRAFT)
    start_location = Column(String, nullable=True) # Point A
    end_location = Column(String, nullable=True)   # Point B
    final_odometer = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    expense_logs = relationship("ExpenseLog", back_populates="trip")
