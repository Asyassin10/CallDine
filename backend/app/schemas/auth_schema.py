"""Authentication API shapes."""

from app.models.user import UserRole
from sqlmodel import SQLModel


class LoginRequest(SQLModel):
    email: str
    password: str


class UserResponse(SQLModel):
    name: str
    email: str
    role: UserRole


class LoginResponse(SQLModel):
    token: str
    user: UserResponse
