import os
from jose import jwt
from datetime import datetime, timedelta
from pwdlib import PasswordHash

# Argon2 hasher
password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


# HASH PASSWORD
def hash_password(password: str) -> str:
    return password_hash.hash(password)


# VERIFY PASSWORD
def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)


# CREATE JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)