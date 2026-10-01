import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("JWT_SECRET", "fin21-dev-secret-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Demo user store — in production this queries a users table in Postgres
USERS = {
    "ravi@tulasisupplies.example": {
        "hashed_password": pwd_context.hash("demo1234"),
        "role": "employee",
        "actor_id": "EMP-0060",
        "name": "Ravi Yadav",
    },
    "karthik@tulasisupplies.example": {
        "hashed_password": pwd_context.hash("demo1234"),
        "role": "manager",
        "actor_id": "EMP-0054",
        "name": "Karthik Jain",
    },
    "arjun@tulasisupplies.example": {
        "hashed_password": pwd_context.hash("demo1234"),
        "role": "finance",
        "actor_id": "EMP-0053",
        "name": "Arjun Prasad",
    },
    "chaitanya@tulasisupplies.example": {
        "hashed_password": pwd_context.hash("demo1234"),
        "role": "admin",
        "actor_id": "EMP-0052",
        "name": "Chaitanya Raju",
    },
}


def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = USERS.get(email.lower().strip())
    if not user:
        return None
    if not pwd_context.verify(password, user["hashed_password"]):
        return None
    return {
        "email": email.lower().strip(),
        "role": user["role"],
        "actor_id": user["actor_id"],
        "name": user["name"],
    }


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def require_role(*allowed_roles: str):
    def dependency(creds: HTTPAuthorizationCredentials = Depends(security)):
        try:
            payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            raise HTTPException(401, "Invalid or expired token")

        role = payload.get("role")
        if allowed_roles and role not in allowed_roles:
            raise HTTPException(403, f"Role '{role}' not permitted. Required: {allowed_roles}")

        return {
            "actor_id": payload.get("sub"),
            "role": role,
            "name": payload.get("name"),
        }
    return dependency