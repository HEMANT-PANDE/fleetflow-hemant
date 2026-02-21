from sqlalchemy import Column, Integer, String, Float, Boolean, Enum, Date # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.database import Base # type: ignore
from app.models.enums import UserRole, VehicleType, VehicleStatus, DriverStatus # type: ignore

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole, values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    is_active = Column(Boolean, default=True)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Name/Model
    license_plate = Column(String, unique=True, index=True, nullable=False)
    max_capacity = Column(Float, nullable=False)  # Max Load Capacity (kg/tons)
    odometer = Column(Float, default=0.0)
    type = Column(Enum(VehicleType, values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    status = Column(Enum(VehicleStatus, values_callable=lambda obj: [e.value for e in obj]), default=VehicleStatus.AVAILABLE)

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
    status = Column(Enum(DriverStatus, values_callable=lambda obj: [e.value for e in obj]), default=DriverStatus.ON_DUTY)

    trips = relationship("Trip", back_populates="driver")
