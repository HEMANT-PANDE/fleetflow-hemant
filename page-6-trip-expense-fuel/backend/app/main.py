import os
from fastapi import FastAPI # type: ignore
from app.routes import vehicle, expense, finance # type: ignore
from app.database import init_db # type: ignore
from app.models import __init__ as _ # type: ignore # Load all models
from dotenv import load_dotenv # type: ignore

load_dotenv()

# Initialize the database
init_db()

app = FastAPI(title=os.getenv("PROJECT_NAME", "FleetFlow Backend"))

app.include_router(vehicle.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(expense.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])

@app.get("/")
def read_root():
    return {"message": "Welcome to FleetFlow Backend APIs"}
