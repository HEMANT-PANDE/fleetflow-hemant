import os
from sqlalchemy import create_engine, text # type: ignore
from dotenv import load_dotenv # type: ignore

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Connecting to: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();")).fetchone()
        print("✅ Successfully connected to the database!")
        print(f"📦 PostgreSQL Version: {result[0]}")
        
        # Let's check the vehicle types enum
        print("\n🔍 Checking 'vehicletype' ENUM values in the database:")
        enum_query = text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'vehicletype'")
        enums = connection.execute(enum_query).fetchall()
        for e in enums:
            print(f" - {e[0]}")
            
except Exception as e:
    print("❌ Failed to connect to the database.")
    print(f"Error: {str(e)}")
