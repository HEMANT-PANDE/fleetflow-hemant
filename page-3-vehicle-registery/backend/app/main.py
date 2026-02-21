from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app.routes import vehicle

# Create tables
Base.metadata.create_all(bind=engine)

# ✅ FIRST define app
app = FastAPI(title="FleetFlow - Page 3 Vehicle Registry")

# Include vehicle routes
app.include_router(vehicle.router)

# ✅ THEN add health check route
@app.get("/health/db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "Database connected successfully"}