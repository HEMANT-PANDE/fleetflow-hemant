from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from . import models, database
from .routers import dispatcher, websockets

# Initialize Database
database.init_db()

app = FastAPI(
    title="FleetFlow Backend API",
    description="Backend API for managing fleets, dispatching trips, and tracking vehicles.",
    version="1.0.0"
)

# CORS configuration for Frontend requests
origins = [
    "http://localhost",
    "http://localhost:5173", # Vite default port
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect Routers
app.include_router(dispatcher.router)
app.include_router(websockets.router)

@app.on_event("startup")
async def startup_event():
    """Start up necessary background tasks."""
    # Launch async task to subscribe to redis pubsub
    asyncio.create_task(websockets.subscribe_redis())

@app.get("/")
def read_root():
    return {"message": "Welcome to FleetFlow API"}
