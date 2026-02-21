from enum import Enum as PyEnum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum, Date, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRole(PyEnum):
    MANAGER = "Manager"
    DISPATCHER = "Dispatcher"
    SAFETY_OFFICER = "Safety Officer"
    FINANCIAL_ANALYST = "Financial Analyst"

class VehicleType(PyEnum):
    TRUCK = "Truck"
    VAN = "Van"
    BIKE = "Bike"

class VehicleStatus(PyEnum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    OUT_OF_SERVICE = "Out of Service"

class DriverStatus(PyEnum):
    ON_DUTY = "On Duty"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"

class TripStatus(PyEnum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Name/Model
    license_plate = Column(String, unique=True, index=True, nullable=False)
    max_capacity = Column(Float, nullable=False)  # Max Load Capacity (kg/tons)
    odometer = Column(Float, default=0.0)
    type = Column(Enum(VehicleType), nullable=False)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.AVAILABLE)

    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    expense_logs = relationship("ExpenseLog", back_populates="vehicle")

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)  # e.g., 'Van', 'Truck'
    license_expiry_date = Column(Date, nullable=False)
    performance_score = Column(Float, default=100.0)  # Safety Score
    trip_completion_rate = Column(Float, default=100.0)
    status = Column(Enum(DriverStatus), default=DriverStatus.ON_DUTY)

    trips = relationship("Trip", back_populates="driver")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float, nullable=False)
    status = Column(Enum(TripStatus), default=TripStatus.DRAFT)
    start_location = Column(String, nullable=True) # Point A
    end_location = Column(String, nullable=True)   # Point B
    final_odometer = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    expense_logs = relationship("ExpenseLog", back_populates="trip")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(String, nullable=False)  # e.g., 'Oil Change'
    description = Column(Text, nullable=True)
    cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    vehicle = relationship("Vehicle", back_populates="maintenance_logs")

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
