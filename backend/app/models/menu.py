"""Menu item database table."""

from sqlmodel import Field, SQLModel


class MenuItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    category_id: int = Field(foreign_key="category.id")
    price: float
    image_url: str
    available: bool = True
    stock_quantity: int = 20
