from datetime import UTC, datetime
from uuid import uuid4

from sqlmodel import Field, SQLModel


class Order(SQLModel, table=True):
    __tablename__ = "customer_order"
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    delivery_address: str
    status: str = "draft"
    subtotal: float = 0
    total: float = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class OrderItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    order_id: str = Field(foreign_key="customer_order.id", index=True)
    menu_item_id: int = Field(foreign_key="menuitem.id")
    name: str
    quantity: int
    unit_price: float
