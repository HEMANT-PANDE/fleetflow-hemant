from fastapi import APIRouter
from . import dashboard, registry, dispatch, driver, maintenance, finance, analytics

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Command Center"])
api_router.include_router(registry.router, prefix="/registry", tags=["Vehicle Registry"])
api_router.include_router(dispatch.router, prefix="/dispatch", tags=["Trip Management"])
api_router.include_router(driver.router, prefix="/drivers", tags=["Driver Management"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["Maintenance Logs"])
api_router.include_router(finance.router, prefix="/finance", tags=["Financial Logs"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Reports"])
