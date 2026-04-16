"""
FOMS MES - Permission Dependencies
Role-Based Access Control for industrial system
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from app.core.config import settings

security = HTTPBearer()

# Role hierarchy (higher number = more permissions)
ROLE_LEVELS = {
    "admin": 3,
    "engineer": 2,
    "operator": 1,
    "viewer": 0
}

# Permission matrix: which roles can perform which actions
PERMISSION_MATRIX = {
    # Machines - admin only
    "POST:/api/v1/machines": ["admin"],
    "PATCH:/api/v1/machines": ["admin"],
    "DELETE:/api/v1/machines": ["admin"],

    # Molds - admin only
    "POST:/api/v1/molds": ["admin"],
    "PATCH:/api/v1/molds": ["admin"],
    "DELETE:/api/v1/molds": ["admin"],

    # Production runs
    "POST:/api/v1/production-runs": ["admin", "engineer"],
    "PATCH:/api/v1/production-runs": ["admin", "engineer", "operator"],
    "DELETE:/api/v1/production-runs": ["admin", "engineer"],

    # Maintenance - admin/engineer
    "POST:/api/v1/maintenance-records": ["admin", "engineer"],
    "PATCH:/api/v1/maintenance-records": ["admin", "engineer"],
    "DELETE:/api/v1/maintenance-records": ["admin"],

    # Rayouns - admin only
    "POST:/api/v1/rayouns": ["admin"],
    "DELETE:/api/v1/rayouns": ["admin"],

    # Boxes - admin only
    "POST:/api/v1/boxes": ["admin"],
    "DELETE:/api/v1/boxes": ["admin"],

    # Users/Accounts - admin only
    "POST:/api/v1/accounts": ["admin"],
    "DELETE:/api/v1/accounts": ["admin"],

    # Seed - admin only
    "POST:/api/v1/seed-all": ["admin"],
    "POST:/api/v1/machine-specs/seed": ["admin"],
}


def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_current_user(credentials = Depends(security)) -> dict:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    return {
        "id": payload.get("user_id"),
        "username": payload.get("sub"),
        "role": payload.get("role", "operator"),
        "first_name": payload.get("first_name"),
        "last_name": payload.get("last_name")
    }


def require_role(allowed_roles: list):
    """Dependency to require specific role(s) for an endpoint"""
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {allowed_roles}"
            )

        return current_user

    return role_checker


def require_min_role(min_level: int):
    """Dependency to require minimum role level"""
    def level_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "operator")
        user_level = ROLE_LEVELS.get(user_role, 0)

        if user_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role level: {min_level}"
            )

        return current_user

    return level_checker


def check_permission(method: str, path: str, user_role: str) -> bool:
    """Check if a role has permission for a specific action"""
    # Admin has full access
    if user_role == "admin":
        return True

    # Check permission matrix
    key = f"{method}:{path}"
    allowed_roles = PERMISSION_MATRIX.get(key, [])

    return user_role in allowed_roles


def require_permission(method: str, path: str):
    """Dependency to check endpoint permission based on role"""
    def permission_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "operator")

        if not check_permission(method, path, user_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions for {method} {path}"
            )

        return current_user

    return permission_checker


def get_user_role() -> str:
    """Helper to get current user role"""
    try:
        user = get_current_user()
        return user.get("role", "operator")
    except:
        return "operator"


# Convenience dependencies
def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Require admin role"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_engineer(current_user: dict = Depends(get_current_user)) -> dict:
    """Require engineer or admin role"""
    user_role = current_user.get("role")
    if user_role not in ["admin", "engineer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Engineer access required"
        )
    return current_user