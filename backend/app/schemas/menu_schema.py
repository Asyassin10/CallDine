"""Menu API request and response shapes."""

from sqlmodel import SQLModel


class CategoryResponse(SQLModel):
    name: str


class MenuItemCreate(SQLModel):
    name: str
    category: str
    price: float
    description: str
    image_url: str
    available: bool = True
    stock_quantity: int = 20


class MenuItemResponse(SQLModel):
    id: int
    name: str
    category: str
    price: float
    description: str
    image_url: str
    available: bool
    stock_quantity: int
