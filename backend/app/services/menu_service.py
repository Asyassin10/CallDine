"""Menu business logic."""

import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen
from uuid import uuid4

from fastapi import UploadFile
from sqlmodel import Session

from app.aws.s3_client import get_s3_client
from app.config import get_settings
from app.models.category import Category
from app.models.menu import MenuItem
from app.repositories import category_repository, menu_repository
from app.schemas.menu_schema import MenuItemCreate, MenuItemResponse

CATEGORY_NAMES = ["Starters", "Pasta", "Main courses", "Seafood", "Vegetarian", "Sides", "Desserts", "Breakfast", "Boissons"]
SOURCE_CATEGORIES = ["Starter", "Pasta", "Seafood", "Side", "Dessert", "Vegetarian", "Vegan", "Breakfast", "Beef", "Chicken", "Lamb", "Goat", "Pork"]
CATEGORY_MAP = {"Starter": "Starters", "Pasta": "Pasta", "Seafood": "Seafood", "Side": "Sides", "Dessert": "Desserts", "Vegetarian": "Vegetarian", "Vegan": "Vegetarian", "Breakfast": "Breakfast", "Beef": "Main courses", "Chicken": "Main courses", "Lamb": "Main courses", "Goat": "Main courses", "Pork": "Main courses"}
PRICE_RANGES = {"Starters": (8, 14), "Pasta": (15, 24), "Main courses": (18, 28), "Seafood": (19, 29), "Vegetarian": (12, 20), "Sides": (5, 9), "Desserts": (7, 10), "Breakfast": (8, 14)}
DRINKS = [
    ("Coca-Cola", 3.5, "https://www.coca-cola.com/content/dam/onexp/ke/home-image/brands/coca-cola-classic/coca_cola_desktop.jpg"),
    ("Coca-Cola Zero", 3.5, "https://prod-spinneys-cdn-new.azureedge.net/media/images/products/2025/11/5449000131836.jpg"),
    ("Fanta Orange", 3.5, "https://media.spar.nl/productdetail/142419.jpg"),
    ("Sprite", 3.5, "https://powellsnl.ca/media/uploads/Valerie-Kelsey/00067000004650_a1c1.jpg"),
    ("Schweppes Tonic", 3.5, "https://www.mymarket.ma/cdn/shop/files/front_en.3.full.jpg?v=1781182929&width=950"),
    ("Ginger Ale", 3.5, "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=600&q=80"),
    ("Still Water", 2.5, "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80"),
    ("Sparkling Water", 2.5, "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80"),
    ("Orange Juice", 4, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80"),
    ("Apple Juice", 4, "https://images.unsplash.com/photo-1576673442511-7e39b6545c87?auto=format&fit=crop&w=600&q=80"),
    ("Pineapple Juice", 4, "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80"),
    ("Mango Juice", 4.5, "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80"),
    ("Fresh Lemonade", 4.5, "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80"),
    ("Peach Iced Tea", 4, "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80"),
    ("Lemon Iced Tea", 4, "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=600&q=80"),
    ("Espresso", 2.5, "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80"),
    ("Americano", 3, "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80"),
    ("Cappuccino", 3.5, "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80"),
    ("Mint Tea", 3, "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80"),
    ("Hot Chocolate", 4, "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80"),
]
FEATURED_ITEMS = {
    "Main courses": [
        ("Classic Hamburger", 10.0, "Grilled beef hamburger with lettuce, tomato, onion, and house sauce.", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"),
        ("Margherita Pizza", 10.0, "Stone-baked pizza with tomato sauce, mozzarella, basil, and olive oil.", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"),
        ("Herb-Roasted Chicken", 23.5, "Tender roasted chicken with garden herbs and a savory pan sauce.", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80"),
        ("Grilled Beef Tenderloin", 28.0, "Juicy grilled beef served with seasonal vegetables and rich jus.", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"),
        ("Moroccan Lamb Tagine", 25.5, "Slow-cooked lamb with warm spices, apricots, and toasted almonds.", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"),
    ],
    "Vegetarian": [
        ("Grilled Halloumi Bowl", 18.0, "Grilled halloumi with quinoa, roasted vegetables, and lemon dressing.", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"),
        ("Wild Mushroom Risotto", 19.5, "Creamy risotto with wild mushrooms, parmesan, and fresh herbs.", "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80"),
        ("Roasted Vegetable Couscous", 17.0, "Fluffy couscous with roasted vegetables, chickpeas, and warm spices.", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"),
    ],
    "Sides": [
        ("Truffle Parmesan Fries", 8.5, "Crisp golden fries finished with parmesan and aromatic truffle oil.", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"),
        ("Garlic Roasted Potatoes", 7.0, "Golden roasted potatoes tossed with garlic, herbs, and sea salt.", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80"),
        ("Seasonal Green Salad", 7.5, "Crisp seasonal greens with cucumber and a light house vinaigrette.", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"),
    ],
    "Desserts": [
        ("Chocolate Fondant", 9.5, "Warm chocolate cake with a molten center and vanilla cream.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"),
        ("Lemon Cheesecake", 9.0, "Silky lemon cheesecake with a buttery biscuit crust.", "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=600&q=80"),
        ("Pistachio Crème Brûlée", 10.0, "Smooth pistachio custard beneath a crisp caramelized sugar crust.", "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80"),
    ],
    "Breakfast": [
        ("Avocado Poached Egg Toast", 13.5, "Sourdough toast topped with avocado, poached eggs, and herbs.", "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"),
        ("Berry Pancake Stack", 12.5, "Fluffy pancakes with fresh berries, maple syrup, and whipped cream.", "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80"),
        ("Moroccan Breakfast Plate", 14.0, "Warm breads, eggs, olives, cheese, honey, and traditional accompaniments.", "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80"),
    ],
}

DESCRIPTIONS = {
    "Starters": "A fresh, flavorful starter prepared to begin your meal beautifully.",
    "Pasta": "Comforting pasta prepared with rich, balanced flavors.",
    "Main courses": "A satisfying main dish prepared fresh with bold flavors.",
    "Seafood": "Fresh seafood prepared with bright, delicate flavors.",
    "Vegetarian": "A colorful vegetarian dish full of fresh ingredients.",
    "Sides": "A delicious side made to complement your meal.",
    "Desserts": "A sweet, indulgent finish to your dining experience.",
    "Breakfast": "A warm and satisfying way to start the day.",
    "Boissons": "A refreshing drink served perfectly chilled or warming hot.",
}


def description_for(category: str) -> str:
    return DESCRIPTIONS[category]


def to_response(item: MenuItem, category: Category) -> MenuItemResponse:
    return MenuItemResponse(id=item.id, name=item.name, category=category.name, price=item.price, description=item.description, image_url=item.image_url, available=item.available, stock_quantity=item.stock_quantity)


def list_menu(session: Session) -> list[MenuItemResponse]:
    return [to_response(item, category) for item, category in menu_repository.list_all(session)]


def search_menu(session: Session, query: str) -> list[MenuItemResponse]:
    general_questions = {"", "all", "available", "food", "menu", "what do you have", "what do you serve"}
    items = menu_repository.list_all(session) if query.strip().lower() in general_questions else menu_repository.search(session, query)
    return [to_response(item, category) for item, category in items if item.available]


def list_categories(session: Session) -> list[Category]:
    return category_repository.list_all(session)


def create_menu_item(session: Session, payload: MenuItemCreate) -> MenuItemResponse | None:
    category = category_repository.get_by_name(session, payload.category)
    if not category:
        return None
    item = menu_repository.save(session, MenuItem(name=payload.name, category_id=category.id, price=payload.price, description=payload.description, image_url=payload.image_url, available=payload.available, stock_quantity=payload.stock_quantity))
    return to_response(item, category)


def update_menu_item(session: Session, item_id: int, payload: MenuItemCreate) -> MenuItemResponse | None:
    item = menu_repository.get_by_id(session, item_id)
    category = category_repository.get_by_name(session, payload.category)
    if not item or not category:
        return None
    item.name = payload.name
    item.category_id = category.id
    item.price = payload.price
    item.description = payload.description
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


def upload_image(file: UploadFile) -> str:
    suffix = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    filename = f"{uuid4()}{suffix}"
    settings = get_settings()
    get_s3_client().upload_fileobj(file.file, settings.s3_access_point or settings.s3_bucket, f"images/menu/{filename}", ExtraArgs={"ContentType": file.content_type or "image/jpeg"})
    return f"/api/menu/images/{filename}"


def get_image(filename: str):
    settings = get_settings()
    return get_s3_client().get_object(Bucket=settings.s3_access_point or settings.s3_bucket, Key=f"images/menu/{filename}")


def price_for(name: str, category: str) -> float:
    value = 0
    for character in name:
        value = (value * 31 + ord(character)) & 0xFFFFFFFF
    low, high = PRICE_RANGES[category]
    return low + (value % ((high - low) * 2 + 1)) / 2


def seed_menu(session: Session) -> None:
    """Save the current 60 TheMealDB dishes the first time the menu is created."""

    remove_specials(session)
    if menu_repository.has_items(session):
        seed_drinks(session)
        seed_featured_items(session)
        seed_descriptions(session)
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
            menu_repository.save(session, MenuItem(name=meal["strMeal"], category_id=categories[category_name].id, price=price_for(meal["strMeal"], category_name), description=description_for(category_name), image_url=meal["strMealThumb"]))
            count += 1
            if count == 60:
                seed_drinks(session)
                seed_featured_items(session)
                seed_descriptions(session)
                return
    seed_drinks(session)
    seed_featured_items(session)
    seed_descriptions(session)


def seed_drinks(session: Session) -> None:
    """Add missing demo drinks without duplicating existing menu items."""

    category = category_repository.get_by_name(session, "Boissons") or category_repository.save(session, Category(name="Boissons"))
    existing = {item.name: item for item, item_category in menu_repository.list_all(session) if item_category.name == "Boissons"}
    for name, price, image in DRINKS:
        if name not in existing:
            menu_repository.save(session, MenuItem(name=name, category_id=category.id, price=price, description=description_for("Boissons"), image_url=image, stock_quantity=20))
        elif not existing[name].image_url.startswith("/api/menu/images/") and existing[name].image_url != image:
            existing[name].image_url = image
            menu_repository.save(session, existing[name])


def seed_featured_items(session: Session) -> None:
    """Add missing featured items without creating duplicates."""

    existing = {item.name for item, _ in menu_repository.list_all(session)}
    for category_name, items in FEATURED_ITEMS.items():
        category = category_repository.get_by_name(session, category_name) or category_repository.save(session, Category(name=category_name))
        for name, price, description, image in items:
            if name not in existing:
                menu_repository.save(session, MenuItem(name=name, category_id=category.id, price=price, description=description, image_url=image, stock_quantity=20))


def remove_specials(session: Session) -> None:
    category = category_repository.get_by_name(session, "Specials")
    if not category:
        return
    for item, item_category in menu_repository.list_all(session):
        if item_category.id == category.id:
            menu_repository.delete(session, item)
    category_repository.delete(session, category)


def seed_descriptions(session: Session) -> None:
    """Fill descriptions on existing seeded menu items without overwriting edits."""

    for item, category in menu_repository.list_all(session):
        if not item.description:
            item.description = description_for(category.name)
            menu_repository.save(session, item)
