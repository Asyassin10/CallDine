"""Menu business logic."""

import json
from urllib.parse import quote
from urllib.request import urlopen

from sqlmodel import Session

from app.models.category import Category
from app.models.menu import MenuItem
from app.repositories import category_repository, menu_repository
from app.schemas.menu_schema import MenuItemCreate, MenuItemResponse

CATEGORY_NAMES = ["Starters", "Pasta", "Main courses", "Seafood", "Vegetarian", "Sides", "Desserts", "Breakfast", "Specials"]
SOURCE_CATEGORIES = ["Starter", "Pasta", "Seafood", "Side", "Dessert", "Vegetarian", "Vegan", "Breakfast", "Beef", "Chicken", "Lamb", "Goat", "Pork", "Miscellaneous"]
CATEGORY_MAP = {"Starter": "Starters", "Pasta": "Pasta", "Seafood": "Seafood", "Side": "Sides", "Dessert": "Desserts", "Vegetarian": "Vegetarian", "Vegan": "Vegetarian", "Breakfast": "Breakfast", "Beef": "Main courses", "Chicken": "Main courses", "Lamb": "Main courses", "Goat": "Main courses", "Pork": "Main courses", "Miscellaneous": "Specials"}
PRICE_RANGES = {"Starters": (8, 14), "Pasta": (15, 24), "Main courses": (18, 28), "Seafood": (19, 29), "Vegetarian": (12, 20), "Sides": (5, 9), "Desserts": (7, 10), "Breakfast": (8, 14), "Specials": (12, 20)}


def to_response(item: MenuItem, category: Category) -> MenuItemResponse:
    return MenuItemResponse(id=item.id, name=item.name, category=category.name, price=item.price, image_url=item.image_url, available=item.available)


def list_menu(session: Session) -> list[MenuItemResponse]:
    return [to_response(item, category) for item, category in menu_repository.list_all(session)]


def list_categories(session: Session) -> list[Category]:
    return category_repository.list_all(session)


def create_menu_item(session: Session, payload: MenuItemCreate) -> MenuItemResponse | None:
    category = category_repository.get_by_name(session, payload.category)
    if not category:
        return None
    item = menu_repository.save(session, MenuItem(name=payload.name, category_id=category.id, price=payload.price, image_url=payload.image_url, available=payload.available))
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
                return
