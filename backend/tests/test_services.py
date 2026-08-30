from sqlmodel import SQLModel, Session, create_engine, select

from app.models.category import Category
from app.models.conversation import ChatMessage, Conversation
from app.models.menu import MenuItem
from app.models.reservation import Reservation, RestaurantTable
from app.models.user import User, UserRole
from app.services import conversation_service, order_service, reservation_service


def session() -> Session:
    engine = create_engine("sqlite://")
    SQLModel.metadata.create_all(engine)
    database = Session(engine)
    category = Category(name="Desserts")
    database.add_all([category, User(name="Mara", email="mara@test.com", password_hash="x", role=UserRole.CUSTOMER)])
    database.commit()
    database.refresh(category)
    database.add(MenuItem(name="Tart", category_id=category.id, price=10, image_url="image", stock_quantity=3))
    database.add_all([RestaurantTable(code="T1", capacity=2), RestaurantTable(code="T2", capacity=4)])
    database.commit()
    return database


def test_confirmed_order_reduces_stock() -> None:
    database = session()
    item = database.exec(select(MenuItem)).first()
    draft = order_service.create_draft(database, 1, [{"menu_item_id": item.id, "quantity": 2}], "1 Main Street", True)
    assert order_service.confirm(database, 1, draft["order_id"], True)["confirmed"]
    assert database.get(MenuItem, item.id).stock_quantity == 1


def test_order_draft_requires_address_confirmation() -> None:
    database = session()
    item = database.exec(select(MenuItem)).first()
    result = order_service.create_draft(database, 1, [{"menu_item_id": item.id, "quantity": 1}], "1 Main Street", False)
    assert not result["valid"]


def test_reservation_blocks_the_same_two_hour_slot() -> None:
    database = session()
    draft = reservation_service.create_draft(database, 1, {"date": "2026-09-01", "time": "19:00", "guests": 4, "customer_name": "Mara", "phone": "123"})
    reservation_service.confirm(database, 1, draft["reservation_id"], True)
    assert "T2" not in reservation_service.check(database, "2026-09-01", "20:00", 4)["tables"]


def test_conversations_belong_to_the_customer() -> None:
    database = session()
    conversation = conversation_service.create(database, 1)
    conversation_service.add_message(database, conversation, "user", "Hello")
    assert conversation_service.get(database, conversation.id, 2) is None
    assert len(conversation_service.messages(database, conversation.id)) == 1
