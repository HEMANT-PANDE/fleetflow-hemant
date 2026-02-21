from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables
from app.routes.analytics import router as analytics_router

app = FastAPI(
    title="FleetFlow - Page 8: Operational Analytics & Financial Reports",
    description="Analytics and reporting API for fleet management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/")
def root():
    return {
        "message": "FleetFlow Analytics & Reports API",
        "page": "Page 8: Operational Analytics & Financial Reports",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Include routers
app.include_router(analytics_router)
