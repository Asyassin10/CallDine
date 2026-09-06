from sqlmodel import SQLModel, Session, create_engine, select

from app.models.category import Category
from app.models.conversation import ChatMessage, Conversation
from app.models.dashboard_metric import DashboardMetric
from app.models.menu import MenuItem
from app.models.order import Order
from app.models.reservation import Reservation, RestaurantTable
from app.models.user import User, UserRole
from app.services import chat_service, conversation_service, dashboard_service, menu_service, order_service, reservation_service


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


def test_latest_order_draft_can_be_confirmed_without_public_id() -> None:
    database = session()
    item = database.exec(select(MenuItem)).first()
    order_service.create_draft(database, 1, [{"menu_item_id": item.id, "quantity": 1}], "1 Main Street", True)
    assert order_service.confirm(database, 1, None, True)["confirmed"]


def test_voice_text_removes_formatting_emojis_and_ids() -> None:
    value = chat_service.clean_for_speech("✅ **Great choice!** Bang Bang Salad (ID 33). Order ID: 5df3987a-4857-40d3-9bfa-34c75b3eab24")
    assert "Great choice!" in value
    assert "**" not in value and "✅" not in value and "ID" not in value and "5df3987a" not in value


def test_guardrail_response_returns_its_blocked_message() -> None:
    choice = {"output": {"message": {"content": [{"text": "This request was blocked."}]}}}
    assert chat_service.guardrail_text(choice) == "This request was blocked."


def test_empty_guardrail_response_has_safe_fallback() -> None:
    assert chat_service.guardrail_text({}) == chat_service.BLOCKED_MESSAGE


def test_streamed_guardrail_without_text_has_safe_fallback() -> None:
    response = {"stream": iter([{"messageStop": {"stopReason": "guardrail_intervened"}}])}
    assert "".join(chat_service.stream(response)) == chat_service.BLOCKED_MESSAGE


def test_reservation_blocks_the_same_two_hour_slot() -> None:
    database = session()
    draft = reservation_service.create_draft(database, 1, {"date": "2026-09-01", "time": "19:00", "guests": 4, "customer_name": "Mara", "phone": "123"})
    reservation_service.confirm(database, 1, draft["reservation_id"], True)
    assert "T2" not in reservation_service.check(database, "2026-09-01", "20:00", 4)["tables"]


def test_latest_reservation_draft_can_be_confirmed_without_public_id() -> None:
    database = session()
    reservation_service.create_draft(database, 1, {"date": "2026-09-02", "time": "19:00", "guests": 2, "customer_name": "Mara", "phone": "123"})
    assert reservation_service.confirm(database, 1, None, True)["confirmed"]


def test_reservation_check_reports_missing_details() -> None:
    result = reservation_service.check(session(), "2026-09-01", "", 0)
    assert result["missing"] == ["time", "guests"]


def test_conversations_belong_to_the_customer() -> None:
    database = session()
    conversation = conversation_service.create(database, 1)
    conversation_service.add_message(database, conversation, "user", "Hello")
    assert conversation_service.get(database, conversation.id, 2) is None
    assert len(conversation_service.messages(database, conversation.id)) == 1


def test_dashboard_seed_is_idempotent_and_isolated() -> None:
    database = session()
    dashboard_service.seed_metrics(database)
    dashboard_service.seed_metrics(database)
    assert len(database.exec(select(DashboardMetric)).all()) == 400
    assert len(database.exec(select(Order)).all()) == 0
    assert len(database.exec(select(Reservation)).all()) == 0


def test_dashboard_returns_seven_chronological_days() -> None:
    database = session()
    dashboard_service.seed_metrics(database)
    result = dashboard_service.dashboard(database)
    assert len(result["days"]) == 7
    assert len(result["months"]) == 12
    assert [day.date for day in result["days"]] == sorted(day.date for day in result["days"])
    assert len({month["orders"] for month in result["months"]}) > 4
    assert sum(result["statuses"].values()) > 0


def test_drink_seed_is_idempotent_for_existing_menu() -> None:
    database = session()
    menu_service.seed_drinks(database)
    menu_service.seed_drinks(database)
    drinks = [(item, category) for item, category in database.exec(select(MenuItem, Category).join(Category)).all() if category.name == "Boissons"]
    assert len(drinks) == 20
    assert all(item.stock_quantity == 20 and item.available for item, _ in drinks)
