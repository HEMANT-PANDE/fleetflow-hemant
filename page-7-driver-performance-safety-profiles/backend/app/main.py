from fastapi import FastAPI
from app.database import engine
from app.models import driver, trip
from app.routes import driver as driver_routes

driver.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FleetFlow - Driver Performance & Safety")

app.include_router(driver_routes.router)

@app.get("/")
def root():
    return {"message": "FleetFlow Driver Performance API Running"}