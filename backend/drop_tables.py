from app.database import Base, engine
import app.models

print("Dropping all existing tables...")
Base.metadata.drop_all(bind=engine)
print("Tables dropped successfully.")
