import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Common connection string mapped to Supabase
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:odooFleetFlow@db.fumslzmnzmwwmkmvhuui.supabase.co:5432/postgres")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
