"""Menu business logic."""

import json
from urllib.parse import quote
from urllib.request import urlopen

from sqlmodel import Session

from app.models.category import Category
from app.models.menu import MenuItem
from app.repositories import category_repository, menu_repository
from app.schemas.menu_schema import MenuItemCreate, MenuItemResponse

CATEGORY_NAMES = ["Starters", "Pasta", "Main courses", "Seafood", "Vegetarian", "Sides", "Desserts", "Breakfast", "Specials", "Boissons"]
SOURCE_CATEGORIES = ["Starter", "Pasta", "Seafood", "Side", "Dessert", "Vegetarian", "Vegan", "Breakfast", "Beef", "Chicken", "Lamb", "Goat", "Pork", "Miscellaneous"]
CATEGORY_MAP = {"Starter": "Starters", "Pasta": "Pasta", "Seafood": "Seafood", "Side": "Sides", "Dessert": "Desserts", "Vegetarian": "Vegetarian", "Vegan": "Vegetarian", "Breakfast": "Breakfast", "Beef": "Main courses", "Chicken": "Main courses", "Lamb": "Main courses", "Goat": "Main courses", "Pork": "Main courses", "Miscellaneous": "Specials"}
PRICE_RANGES = {"Starters": (8, 14), "Pasta": (15, 24), "Main courses": (18, 28), "Seafood": (19, 29), "Vegetarian": (12, 20), "Sides": (5, 9), "Desserts": (7, 10), "Breakfast": (8, 14), "Specials": (12, 20)}
SODA_IMAGE = "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=600&q=80"
WATER_IMAGE = "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80"
JUICE_IMAGE = "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80"
COFFEE_IMAGE = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80"
TEA_IMAGE = "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80"
DRINKS = [
    ("Coca-Cola", 3.5, SODA_IMAGE), ("Coca-Cola Zero", 3.5, SODA_IMAGE),
    ("Fanta Orange", 3.5, SODA_IMAGE), ("Sprite", 3.5, SODA_IMAGE),
    ("Schweppes Tonic", 3.5, SODA_IMAGE), ("Ginger Ale", 3.5, SODA_IMAGE),
    ("Still Water", 2.5, WATER_IMAGE), ("Sparkling Water", 2.5, WATER_IMAGE),
    ("Orange Juice", 4, JUICE_IMAGE), ("Apple Juice", 4, JUICE_IMAGE),
    ("Pineapple Juice", 4, JUICE_IMAGE), ("Mango Juice", 4.5, JUICE_IMAGE),
    ("Fresh Lemonade", 4.5, JUICE_IMAGE), ("Peach Iced Tea", 4, TEA_IMAGE),
    ("Lemon Iced Tea", 4, TEA_IMAGE), ("Espresso", 2.5, COFFEE_IMAGE),
    ("Americano", 3, COFFEE_IMAGE), ("Cappuccino", 3.5, COFFEE_IMAGE),
    ("Mint Tea", 3, TEA_IMAGE), ("Hot Chocolate", 4, COFFEE_IMAGE),
]


def to_response(item: MenuItem, category: Category) -> MenuItemResponse:
    return MenuItemResponse(id=item.id, name=item.name, category=category.name, price=item.price, image_url=item.image_url, available=item.available, stock_quantity=item.stock_quantity)


def list_menu(session: Session) -> list[MenuItemResponse]:
    return [to_response(item, category) for item, category in menu_repository.list_all(session)]


def search_menu(session: Session, query: str) -> list[MenuItemResponse]:
    return [to_response(item, category) for item, category in menu_repository.search(session, query)]


def list_categories(session: Session) -> list[Category]:
    return category_repository.list_all(session)


def create_menu_item(session: Session, payload: MenuItemCreate) -> MenuItemResponse | None:
    category = category_repository.get_by_name(session, payload.category)
    if not category:
        return None
    item = menu_repository.save(session, MenuItem(name=payload.name, category_id=category.id, price=payload.price, image_url=payload.image_url, available=payload.available, stock_quantity=payload.stock_quantity))
    return to_response(item, category)


def update_menu_item(session: Session, item_id: int, payload: MenuItemCreate) -> MenuItemResponse | None:
    item = menu_repository.get_by_id(session, item_id)
    category = category_repository.get_by_name(session, payload.category)
    if not item or not category:
        return None
    item.name = payload.name
    item.category_id = category.id
    item.price = payload.price
    item.image_url = payload.image_url
    item.available = payload.available
    item.stock_quantity = payload.stock_quantity
    return to_response(menu_repository.save(session, item), category)


def delete_menu_item(session: Session, item_id: int) -> bool:
    item = menu_repository.get_by_id(session, item_id)
    if not item:
        return False
    menu_repository.delete(session, item)
    return True


def price_for(name: str, category: str) -> float:
    value = 0
    for character in name:
        value = (value * 31 + ord(character)) & 0xFFFFFFFF
    low, high = PRICE_RANGES[category]
    return low + (value % ((high - low) * 2 + 1)) / 2


def seed_menu(session: Session) -> None:
    """Save the current 60 TheMealDB dishes the first time the menu is created."""

    if menu_repository.has_items(session):
        seed_drinks(session)
        return
    categories = {}
    for name in CATEGORY_NAMES:
        category = category_repository.get_by_name(session, name) or category_repository.save(session, Category(name=name))
        categories[name] = category

    seen: set[str] = set()
    count = 0
    for source in SOURCE_CATEGORIES:
        with urlopen(f"https://www.themealdb.com/api/json/v1/1/filter.php?c={quote(source)}", timeout=15) as response:
            meals = json.load(response).get("meals") or []
        for meal in meals:
            if meal["idMeal"] in seen:
                continue
            seen.add(meal["idMeal"])
            category_name = CATEGORY_MAP[source]
            menu_repository.save(session, MenuItem(name=meal["strMeal"], category_id=categories[category_name].id, price=price_for(meal["strMeal"], category_name), image_url=meal["strMealThumb"]))
            count += 1
            if count == 60:
                seed_drinks(session)
                return
    seed_drinks(session)


def seed_drinks(session: Session) -> None:
    """Add missing demo drinks without duplicating existing menu items."""

    category = category_repository.get_by_name(session, "Boissons") or category_repository.save(session, Category(name="Boissons"))
    existing = {item.name for item, item_category in menu_repository.list_all(session) if item_category.name == "Boissons"}
    for name, price, image in DRINKS:
        if name not in existing:
            menu_repository.save(session, MenuItem(name=name, category_id=category.id, price=price, image_url=image, stock_quantity=20))
