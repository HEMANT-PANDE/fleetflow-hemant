from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.enums import UserRole

# Basic User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum(UserRole, values_callable=lambda obj: [e.value for e in obj]), 
        nullable=False
    )
