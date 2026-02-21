import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# We can fall back to the supabase URL used in other microservices if env var is not present
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:odooFleetFlow@db.fumslzmnzmwwmkmvhuui.supabase.co:5432/postgres")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
