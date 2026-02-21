from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import VehicleType, VehicleStatus

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)  # Name/Model
    license_plate = Column(String, unique=True, index=True, nullable=False)
    max_capacity = Column(Float, nullable=False)
    odometer = Column(Float, default=0.0)

    type = Column(
        Enum(
            VehicleType,
            values_callable=lambda obj: [e.value for e in obj],  # 🔥 THIS IS THE FIX
        ),
        nullable=False
    )

    status = Column(
        Enum(
            VehicleStatus,
            values_callable=lambda obj: [e.value for e in obj],  # 🔥 SAME FIX
        ),
        default=VehicleStatus.AVAILABLE
    )
