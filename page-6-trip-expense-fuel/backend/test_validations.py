import requests  # type: ignore
import json
from datetime import date

# If your main.py uses prefix="/api", keep this.
# Otherwise change to: http://127.0.0.1:8000
base_url = "http://127.0.0.1:8000/api"


def print_response(title, response):
    print(f"=== {title} ===")
    print(f"HTTP {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except Exception:
        print(response.text)
    print("\n")


def run_tests():
    # 1️⃣ Create or fetch a Vehicle to test against
    vehicle_data = {
        "name": "Ford Transit",
        "license_plate": "TEST-1234",
        "max_capacity": 2000,
        "type": "Van",
        "odometer": 15000,
        "status": "Available"
    }

    r_veh = requests.post(f"{base_url}/vehicles/", json=vehicle_data)

    if r_veh.status_code in [200, 201]:
        vehicle_id = r_veh.json().get("id")
    else:
        # Vehicle might already exist → fetch list safely
        vehicles_response = requests.get(f"{base_url}/vehicles/")
        if vehicles_response.status_code != 200:
            print("Failed to fetch vehicles.")
            return
        
        vehicles = vehicles_response.json()
        if not vehicles:
            print("No vehicles available to test.")
            return
        
        vehicle_id = vehicles[0]["id"]

    print(f"Using Vehicle ID: {vehicle_id}\n")

    # 2️⃣ Test Invalid Expense: Negative Cost
    print_response(
        "TEST 1: Negative Cost (Should Fail)",
        requests.post(
            f"{base_url}/expenses/",
            json={
                "vehicle_id": vehicle_id,
                "expense_type": "Toll",
                "cost": -50.0,
                "date": str(date.today())
            }
        )
    )

    # 3️⃣ Test Invalid Expense: Fuel missing liters
    print_response(
        "TEST 2: Fuel missing Liters (Should Fail)",
        requests.post(
            f"{base_url}/expenses/",
            json={
                "vehicle_id": vehicle_id,
                "expense_type": "Fuel",
                "cost": 100.0,
                "liters": 0,
                "date": str(date.today())
            }
        )
    )

    # 4️⃣ Test Invalid Expense: Toll with liters
    print_response(
        "TEST 3: Non-Fuel with Liters (Should Fail)",
        requests.post(
            f"{base_url}/expenses/",
            json={
                "vehicle_id": vehicle_id,
                "expense_type": "Toll",
                "cost": 15.0,
                "liters": 5.0,
                "date": str(date.today())
            }
        )
    )

    # 5️⃣ Test Invalid Expense: Vehicle doesn't exist
    print_response(
        "TEST 4: Non-existent Vehicle (Should Fail)",
        requests.post(
            f"{base_url}/expenses/",
            json={
                "vehicle_id": 9999,
                "expense_type": "Toll",
                "cost": 15.0,
                "date": str(date.today())
            }
        )
    )

    # 6️⃣ Test Valid Expense: Fuel
    print_response(
        "TEST 5: Valid Fuel Expense (Should Pass)",
        requests.post(
            f"{base_url}/expenses/",
            json={
                "vehicle_id": vehicle_id,
                "expense_type": "Fuel",
                "cost": 120.0,
                "liters": 40.5,
                "date": str(date.today())
            }
        )
    )

    # 7️⃣ Test Valid Expense: Toll
    print_response(
        "TEST 6: Valid Toll Expense (Should Pass)",
        requests.post(
            f"{base_url}/expenses/",
            json={
                "vehicle_id": vehicle_id,
                "expense_type": "Toll",
                "cost": 25.0,
                "date": str(date.today())
            }
        )
    )

    # 8️⃣ Test Dynamic Finance Calculation (Corrected Endpoint)
    print_response(
        "TEST 7: Check Vehicle Operational Costs dynamically",
        requests.get(
            f"{base_url}/finance/vehicle/{vehicle_id}/operational-cost"
        )
    )


if __name__ == "__main__":
    run_tests()
