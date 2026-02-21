from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import FuelType

class MaintenanceLog(Base):
    """Page 5: Maintenance and Service Logs"""
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    
    service_type = Column(String, nullable=False)  # e.g., 'Oil Change', 'Tire Rotation'
    description = Column(Text, nullable=True)
    cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    vehicle = relationship("Vehicle", back_populates="maintenance_logs")


class ExpenseLog(Base):
    """Page 6/8: Operational Expenses"""
    __tablename__ = "expense_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)  # Optional link to a specific trip
    
    expense_type = Column(String, nullable=False) # e.g., 'Toll', 'Parking'
    cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    vehicle = relationship("Vehicle", back_populates="expense_logs")
    trip = relationship("Trip", back_populates="expense_logs")


class FuelLog(Base):
    """Page 6/8: Fuel Expenses"""
    __tablename__ = "fuel_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    
    fuel_type = Column(
        Enum(FuelType, values_callable=lambda obj: [e.value for e in obj]), 
        nullable=True
    )
    quantity_liters = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    odometer_reading = Column(Float, nullable=True) # Used to calculate fuel efficiency 

    vehicle = relationship("Vehicle", back_populates="fuel_logs")
