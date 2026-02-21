from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app.routes import dashboard

# Create tables if they do not exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Failed to create tables (might be using asyncpg in URL or DB is down): {e}")

app = FastAPI(title="FleetFlow - Page 2 Command Center Dashboard")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(dashboard.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/health/db")
def test_db(db: Session = Depends(get_db)):
    # Basic query to verify DB connection
    from app.models.vehicle import Vehicle
    try:
        count = db.query(Vehicle).count()
        return {"message": "Database connected successfully", "vehicle_count": count}
    except Exception as e:
        return {"error": str(e)}
