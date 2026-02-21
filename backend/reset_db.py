from sqlalchemy import text
from app.database import engine

print("Wiping public schema entirely...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    conn.commit()
print("Wipe complete.")
