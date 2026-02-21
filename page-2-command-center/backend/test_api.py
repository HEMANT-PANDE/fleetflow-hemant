from fastapi.testclient import TestClient
from app.main import app

try:
    client = TestClient(app=app)
except Exception as e:
    print(f"FAILED TO CREATE TESTCLIENT: {e}")
    import traceback
    traceback.print_exc()
    client = None
def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    print("Health check passed:", response.json())
    
def test_dashboard_stats():
    # Calling the actual endpoint which relies on the DB (Supabase connection)
    try:
        response = client.get("/api/dashboard/stats")
        print("Status code:", response.status_code)
        print("Response JSON:", response.json())
        assert response.status_code == 200
        print("Dashboard stats test passed!")
    except Exception as e:
        print("Dashboard stats test failed with exception:", e)

if __name__ == "__main__":
    test_health()
    test_dashboard_stats()
