from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session  # pyright: ignore[reportMissingImports]

from app.database.session import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token, decode_access_token

router = APIRouter(tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    hospital_id: Optional[str] = None
    username: str

# Pre-seeded fallback user credentials map for instant testing/demonstration
PRESEEDED_USERS = {
    "admin": {
        "password_hash": "admin123",
        "role": "admin",
        "hospital_id": None,
    },
    "coordinator_1": {
        "password_hash": "coord123",
        "role": "coordinator",
        "hospital_id": "hosp_001",
    },
    "coordinator_2": {
        "password_hash": "coord123",
        "role": "coordinator",
        "hospital_id": "hosp_002",
    },
    "dispatcher_1": {
        "password_hash": "dispatch123",
        "role": "dispatcher",
        "hospital_id": None,
    },
}

@router.post("/auth/login", response_model=TokenResponse)
def login_for_access_token(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    # First check database for registered user
    user = db.query(User).filter(User.username == payload.username).first() if db else None

    if user:
        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )
        role = user.role
        hosp_id = user.hospital_id
        username = user.username
    elif payload.username in PRESEEDED_USERS:
        seeded = PRESEEDED_USERS[payload.username]
        if payload.password != seeded["password_hash"] and not verify_password(payload.password, seeded["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )
        role = seeded["role"]
        hosp_id = seeded["hospital_id"]
        username = payload.username
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Pre-seeded credentials required.",
        )

    access_token = create_access_token(
        data={"sub": username, "role": role, "hospital_id": hosp_id}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=role,
        hospital_id=hosp_id,
        username=username,
    )

def get_current_user(
    authorization: Optional[str] = Header(None)
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired JWT token",
        )
    return payload

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied for your user role",
            )
        return current_user
    return role_checker
