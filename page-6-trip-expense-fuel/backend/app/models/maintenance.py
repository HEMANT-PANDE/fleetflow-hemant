from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.database import Base # type: ignore

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(String, nullable=False)  # e.g., 'Oil Change'
    description = Column(Text, nullable=True)
    cost = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
