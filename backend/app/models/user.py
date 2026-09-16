"""User database table."""

from enum import Enum

from sqlmodel import Field, SQLModel


class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: UserRole = Field(index=True)
    token: str | None = Field(default=None, index=True)
