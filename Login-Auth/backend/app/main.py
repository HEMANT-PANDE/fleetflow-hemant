from fastapi import FastAPI
from app.database import engine, Base
from app.routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FleetFlow Authentication Service")

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "FleetFlow Auth Service Running"}