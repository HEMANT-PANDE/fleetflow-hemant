from pydantic import BaseModel

class DashboardStats(BaseModel):
    active_fleet: int
    maintenance_alerts: int
    utilization_rate_percent: float
    pending_cargo: int
