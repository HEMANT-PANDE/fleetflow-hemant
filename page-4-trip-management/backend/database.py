from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Using asyncpg for async database operations
SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://postgres:odooFleetFlow@db.fumslzmnzmwwmkmvhuui.supabase.co:5432/postgres"
# For simplicity with synchronous models already defined, we'll setup normal psycopg2 for now
SYNC_DATABASE_URL = "postgresql://postgres:odooFleetFlow@db.fumslzmnzmwwmkmvhuui.supabase.co:5432/postgres"

engine = create_engine(SYNC_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
