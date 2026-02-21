import sys
import traceback

from backend.database import engine, SessionLocal, init_db
from sqlalchemy import text

def test_connection():
    try:
        print("Testing Supabase connection...")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Connection successful! Result:", result.scalar())
            
        print("Initializing Database tables...")
        init_db()
        print("Tables created successfully!")
        
    except Exception as e:
        print("Error connecting to database:")
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
