from datetime import UTC, datetime
from uuid import uuid4

from sqlmodel import Field, SQLModel


class RestaurantTable(SQLModel, table=True):
    code: str = Field(primary_key=True)
    capacity: int
    active: bool = True


class Reservation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    customer_name: str
    phone: str
    date: str
    time: str
    guests: int
    table_code: str | None = None
    status: str = "draft"
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
