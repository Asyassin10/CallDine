"""Menu API request and response shapes."""

from sqlmodel import SQLModel


class CategoryResponse(SQLModel):
    name: str


class MenuItemCreate(SQLModel):
    name: str
    category: str
    price: float
    image_url: str
    available: bool = True


class MenuItemResponse(SQLModel):
    id: int
    name: str
    category: str
    price: float
    image_url: str
    available: bool
