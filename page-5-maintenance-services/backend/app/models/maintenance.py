from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.enums import MaintenanceType


class MaintenanceLog(Base):
    """
    Maintenance log model for Page 5: Maintenance & Service Logs.
    
    Features:
    - Preventive and reactive health tracking
    - Logic Link: Adding a log changes vehicle status to "In Shop"
    """
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    
    # Maintenance details
    maintenance_type = Column(Enum(MaintenanceType), nullable=False)
    description = Column(Text, nullable=False)
    service_provider = Column(String(255))
    
    # Cost breakdown
    parts_cost = Column(Float, default=0)
    labor_cost = Column(Float, default=0)
    total_cost = Column(Float, default=0)
    
    # Timing
    service_date = Column(DateTime(timezone=True), nullable=False)
    completion_date = Column(DateTime(timezone=True))
    
    # Status
    is_completed = Column(Boolean, default=False)
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
