import redis
import json

# REDIS_URL = "redis://localhost:6379/0"

# redis_client = redis.from_url(REDIS_URL, decode_responses=True)
redis_client = None

class VehicleLockManager:
    """Manages temporary Redis locks for vehicles being dispatched. (MOCKED)"""
    
    @staticmethod
    def lock_vehicle(vehicle_id: int, dispatcher_id: int, expire_seconds: int = 300) -> bool:
        """Attempts to acquire a lock on a vehicle. Returns True if successful."""
        # lock_key = f"vehicle_lock:{vehicle_id}"
        # return redis_client.set(lock_key, dispatcher_id, ex=expire_seconds, nx=True)
        return True
    
    @staticmethod
    def unlock_vehicle(vehicle_id: int, dispatcher_id: int) -> bool:
        """Releases the lock on a vehicle if it belongs to the dispatcher."""
        # lock_key = f"vehicle_lock:{vehicle_id}"
        # current_lock = redis_client.get(lock_key)
        # 
        # if current_lock and str(current_lock) == str(dispatcher_id):
        #     redis_client.delete(lock_key)
        #     return True
        # return False
        return True

    @staticmethod
    def is_locked(vehicle_id: int) -> bool:
        """Checks if a vehicle is currently locked."""
        # lock_key = f"vehicle_lock:{vehicle_id}"
        # return redis_client.exists(lock_key) > 0
        return False

class PubSubManager:
    """Manages publishing simple real-time updates via Redis."""
    
    @staticmethod
    def publish_update(channel: str, message: dict):
        # redis_client.publish(channel, json.dumps(message))
        pass
