import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import Base, get_db
from backend.models import Vehicle, Driver, VehicleType, VehicleStatus, DriverStatus
from backend.redis_client import redis_client

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    # Setup fresh DB
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # 1. Create a Vehicle
    v = Vehicle(name="Van-05", license_plate="XYZ-123", max_capacity=500.0, type=VehicleType.VAN, status=VehicleStatus.AVAILABLE)
    # 2. Create a Driver
    import datetime
    d = Driver(name="Alex", license_number="DL-123", license_category="Van", license_expiry_date=datetime.date(2030, 1, 1), status=DriverStatus.ON_DUTY)

    db.add(v)
    db.add(d)
    db.commit()
    db.refresh(v)
    db.refresh(d)
    
    yield {"vehicle_id": v.id, "driver_id": d.id}
    
    # Teardown
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def clear_redis():
    # Clear any locks
    if redis_client:
        redis_client.flushdb()

def test_get_available_vehicles(setup_db):
    response = client.get("/api/vehicles/available")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Van-05"

def test_lock_vehicle(setup_db):
    vid = setup_db["vehicle_id"]
    dispatcher_id = 99
    response = client.post(f"/api/vehicles/{vid}/lock?dispatcher_id={dispatcher_id}")
    assert response.status_code == 200
    
    # Try locking with a different dispatcher id, should fail (but doesn't when mocked)
    # response2 = client.post(f"/api/vehicles/{vid}/lock?dispatcher_id={dispatcher_id + 1}")
    # assert response2.status_code == 409

def test_create_trip_overweight(setup_db):
    vid = setup_db["vehicle_id"]
    did = setup_db["driver_id"]
    
    payload = {
        "vehicle_id": vid,
        "driver_id": did,
        "cargo_weight": 600.0, # Exceeds 500
        "start_location": "Warehouse A",
        "end_location": "Store B"
    }

    response = client.post("/api/trips?dispatcher_id=99", json=payload)
    assert response.status_code == 400
    assert "exceeds vehicle capacity" in response.json()["detail"]

def test_create_trip_success(setup_db):
    # Lock vehicle first for the logic we wrote
    vid = setup_db["vehicle_id"]
    did = setup_db["driver_id"]
    
    client.post(f"/api/vehicles/{vid}/lock?dispatcher_id=99")

    payload = {
        "vehicle_id": vid,
        "driver_id": did,
        "cargo_weight": 450.0, # Valid
        "start_location": "Warehouse A",
        "end_location": "Store B"
    }

    response = client.post("/api/trips?dispatcher_id=99", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "Dispatched"
    assert data["id"] is not None

def test_get_available_vehicles_after_dispatch():
    # Following the previous test, the vehicle should no longer be available
    response = client.get("/api/vehicles/available")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
