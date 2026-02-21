import traceback
from fastapi.testclient import TestClient
from app.main import app

print("Initializing TestClient for the Modular Monolith...")
try:
    client = TestClient(app=app)
    
    # 1. Test Root Health
    res_health = client.get("/health")
    print(f"Health Check: {res_health.status_code} - {res_health.json()}")
    assert res_health.status_code == 200

    # 2. Test Centralized Dashboard Route
    res_dash = client.get("/api/v1/dashboard/dashboard/stats")
    print(f"Dashboard Stats: {res_dash.status_code} - {res_dash.json()}")
    assert res_dash.status_code == 200
    
    # 3. Test Centralized Vehicle Registry Route
    res_vehicles = client.get("/api/v1/registry/vehicles/")
    print(f"Vehicle Registry (Empty DB): {res_vehicles.status_code} - {res_vehicles.json()}")
    assert res_vehicles.status_code == 200
    
    print("\nSUCCESS! All monolith endpoints are available and correctly mapping models.")

except Exception as e:
    print(f"Modular monolith test failed: {e}")
    traceback.print_exc()
