from sqlmodel import Session

from app.models.order import Order, OrderItem
from app.repositories import menu_repository, order_repository


def check_items(session: Session, items: list[dict]) -> dict:
    checked, subtotal, valid = [], 0.0, True
    for value in items:
        item = menu_repository.get_by_id(session, int(value["menu_item_id"]))
        quantity = int(value["quantity"])
        item_valid = bool(item and item.available and quantity > 0 and quantity <= item.stock_quantity)
        checked.append({"menu_item_id": value["menu_item_id"], "name": item.name if item else "Unknown item", "quantity": quantity, "unit_price": item.price if item else 0, "available": item_valid})
        if item_valid:
            subtotal += item.price * quantity
        valid = valid and item_valid
    return {"valid": valid, "items": checked, "subtotal": round(subtotal, 2)}


def create_draft(session: Session, user_id: int, items: list[dict], delivery_address: str, address_confirmed: bool) -> dict:
    checked = check_items(session, items)
    if not checked["valid"] or not delivery_address.strip() or not address_confirmed:
        return {"valid": False, "message": "Items or delivery address are not valid."}
    order = order_repository.save_order(session, Order(user_id=user_id, delivery_address=delivery_address.strip(), subtotal=checked["subtotal"], total=checked["subtotal"]))
    order_repository.save_items(session, [OrderItem(order_id=order.id, menu_item_id=item["menu_item_id"], name=item["name"], quantity=item["quantity"], unit_price=item["unit_price"]) for item in checked["items"]])
    return {"valid": True, "order_id": order.id, "items": checked["items"], "delivery_address": order.delivery_address, "total": order.total}


def confirm(session: Session, user_id: int, order_id: str | None, confirmed: bool) -> dict:
    order = order_repository.get_order(session, order_id, user_id) if order_id else order_repository.latest_draft(session, user_id)
    if not order:
        return {"confirmed": False, "message": "No order draft exists. Create the order draft first."}
    if order.status != "draft" or not confirmed:
        return {"confirmed": False}
    items = order_repository.list_items(session, order.id)
    checked = check_items(session, [{"menu_item_id": item.menu_item_id, "quantity": item.quantity} for item in items])
    if not checked["valid"]:
        return {"confirmed": False, "message": "One or more items are no longer available."}
    for item in items:
        menu = menu_repository.get_by_id(session, item.menu_item_id)
        menu.stock_quantity -= item.quantity
        menu_repository.save(session, menu)
    order.status = "confirmed"
    order_repository.save_order(session, order)
    return {"confirmed": True, "order_id": order.id, "total": order.total}


def list_confirmed(session: Session, user_id: int) -> list[Order]:
    return order_repository.list_confirmed(session, user_id)


def details(session: Session, user_id: int, order_id: str) -> dict | None:
    order = order_repository.get_order(session, order_id, user_id)
    if not order or order.status == "draft":
        return None
    return {**order.model_dump(), "items": order_repository.list_items(session, order.id)}


def list_all_confirmed(session: Session):
    return [
        {"id": order.id, "customer_name": customer_name, "delivery_address": order.delivery_address, "status": order.status, "total": order.total, "created_at": order.created_at}
        for order, customer_name in order_repository.list_all_confirmed(session)
    ]


def admin_details(session: Session, order_id: str) -> dict | None:
    result = order_repository.get_order_with_customer(session, order_id)
    if not result:
        return None
    order, customer_name = result
    return {**order.model_dump(), "customer_name": customer_name, "items": order_repository.list_items(session, order.id)}
