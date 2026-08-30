"""Tool descriptions and dispatching for the CallDine AI assistant."""

from sqlmodel import Session

from app.services import knowledge_service, menu_service, order_service, reservation_service


def tool(name: str, description: str, properties: dict, required: list[str] = []) -> dict:
    return {"toolSpec": {"name": name, "description": description, "inputSchema": {"json": {"type": "object", "properties": properties, "required": required}}}}


ITEMS = {"items": {"type": "array", "items": {"type": "object", "properties": {"menu_item_id": {"type": "integer"}, "quantity": {"type": "integer"}}, "required": ["menu_item_id", "quantity"]}}}

TOOL_CONFIG = {"tools": [
    tool("search_knowledge", "Search restaurant PDFs for hours, location, policies, FAQs, and general details.", {"query": {"type": "string"}}, ["query"]),
    tool("search_menu", "Find menu items by name or category, including price and availability.", {"query": {"type": "string"}}, ["query"]),
    tool("check_order_items", "Validate item quantities, current availability, stock, and subtotal before creating an order.", ITEMS, ["items"]),
    tool("create_order_draft", "Create an unconfirmed delivery order draft only after the customer confirms the repeated delivery address.", {**ITEMS, "delivery_address": {"type": "string"}, "address_confirmed": {"type": "boolean"}}, ["items", "delivery_address", "address_confirmed"]),
    tool("confirm_order", "Confirm a delivery order only after the customer clearly agrees to the final order summary.", {"order_id": {"type": "string"}, "confirmed": {"type": "boolean"}}, ["order_id", "confirmed"]),
    tool("check_table_availability", "Check tables that can seat a party at a requested date and time.", {"date": {"type": "string"}, "time": {"type": "string"}, "guests": {"type": "integer"}}, ["date", "time", "guests"]),
    tool("create_reservation_draft", "Create an unconfirmed reservation draft after collecting date, time, guest count, name, and phone.", {"date": {"type": "string"}, "time": {"type": "string"}, "guests": {"type": "integer"}, "customer_name": {"type": "string"}, "phone": {"type": "string"}}, ["date", "time", "guests", "customer_name", "phone"]),
    tool("confirm_reservation", "Confirm a reservation only after the customer clearly agrees to the booking summary.", {"reservation_id": {"type": "string"}, "confirmed": {"type": "boolean"}}, ["reservation_id", "confirmed"]),
]}


def run_tool(session: Session, user_id: int, name: str, values: dict) -> dict:
    if name == "search_knowledge":
        return {"chunks": knowledge_service.search(values["query"])}
    if name == "search_menu":
        return {"items": [item.model_dump() for item in menu_service.search_menu(session, values["query"])]}
    if name == "check_order_items":
        return order_service.check_items(session, values["items"])
    if name == "create_order_draft":
        return order_service.create_draft(session, user_id, values["items"], values["delivery_address"], values["address_confirmed"])
    if name == "confirm_order":
        return order_service.confirm(session, user_id, values["order_id"], values["confirmed"])
    if name == "check_table_availability":
        return reservation_service.check(session, values["date"], values["time"], values["guests"])
    if name == "create_reservation_draft":
        return reservation_service.create_draft(session, user_id, values)
    if name == "confirm_reservation":
        return reservation_service.confirm(session, user_id, values["reservation_id"], values["confirmed"])
    return {"error": "Unknown tool"}
