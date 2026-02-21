from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import create_tables
from app.routes import maintenance_router

load_dotenv()

# Get CORS origins from environment
CORS_ORIGINS = os.getenv("CORS_ORIGINS", '["http://localhost:5173", "http://localhost:3000"]')


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup: Create database tables
    create_tables()
    print("🚀 FleetFlow API starting up...")
    yield
    # Shutdown
    print("👋 FleetFlow API shutting down...")


# Create FastAPI application
app = FastAPI(
    title="FleetFlow",
    description="Modular Fleet & Logistics Management System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(maintenance_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": "FleetFlow",
        "version": "1.0.0",
        "description": "Fleet & Logistics Management System API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "FleetFlow"}

