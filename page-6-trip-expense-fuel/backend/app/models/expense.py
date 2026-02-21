from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.database import Base # type: ignore

class ExpenseLog(Base):
    __tablename__ = "expense_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)  # Optional link to a specific trip
    expense_type = Column(String, nullable=False) # e.g., 'Fuel', 'Toll'
    liters = Column(Float, nullable=True) # For fuel logging
    cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    vehicle = relationship("Vehicle", back_populates="expense_logs")
    trip = relationship("Trip", back_populates="expense_logs")
