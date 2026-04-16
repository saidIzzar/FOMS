"""
FOMS MES - Authentication Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.config import settings
import jwt
import bcrypt
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

# User model - check if exists in main database
try:
    from app.models.database_models import Branch, MachineSpec, Machine, Mold, ProductionRun
    HAS_USER_MODEL = False
except ImportError:
    HAS_USER_MODEL = False

# Simple in-memory user store for demo (replace with database in production)
# Pre-hashed passwords (same hash every time)
ADMIN_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4b6VvETK9ufLJSbK"
ENGINEER_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4b6VvETK9ufLJSbK"
YASSIN_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4b6VvETK9ufLJSbK"

USERS_DB = {
    "admin": {
        "id": 1,
        "username": "admin",
        "password": ADMIN_HASH,
        "email": "admin@foms.com",
        "first_name": "Admin",
        "last_name": "User",
        "role": "admin",
        "department": "IT",
        "position": "System Administrator",
        "language": "en"
    },
    "engineer": {
        "id": 2,
        "username": "engineer",
        "password": ENGINEER_HASH,
        "email": "engineer@foms.com",
        "first_name": "John",
        "last_name": "Engineer",
        "role": "engineer",
        "department": "Engineering",
        "position": "Process Engineer",
        "language": "en"
    },
    "yassin": {
        "id": 3,
        "username": "yassin",
        "password": YASSIN_HASH,
        "email": "yassin@foms.com",
        "first_name": "Yassin",
        "last_name": "Operator",
        "role": "operator",
        "department": "Production",
        "position": "Machine Operator",
        "language": "ar"
    }
}

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    role: str
    department: str
    position: str
    language: str

@router.post("/token")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    
    user = USERS_DB.get(request.username)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(request.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    payload = {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"]
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    
    return {
        "access": token,
        "user": UserResponse(**user)
    }

@router.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    """Get current user info (requires auth)"""
    # For demo, return admin user
    return UserResponse(**USERS_DB["admin"])

@router.post("/register")
def register(request: LoginRequest, db: Session = Depends(get_db)):
    """Register new user"""
    
    if request.username in USERS_DB:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create new user
    user_id = len(USERS_DB) + 1
    new_user = {
        "id": user_id,
        "username": request.username,
        "password": bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode(),
        "email": f"{request.username}@foms.com",
        "first_name": request.username.title(),
        "last_name": "User",
        "role": "operator",
        "department": "Production",
        "position": "Operator",
        "language": "en"
    }
    
    USERS_DB[request.username] = new_user
    
    # Create token
    payload = {
        "id": new_user["id"],
        "username": new_user["username"],
        "role": new_user["role"]
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    
    return {
        "access": token,
        "user": UserResponse(**new_user)
    }
