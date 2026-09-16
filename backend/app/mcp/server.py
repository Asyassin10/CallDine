"""CallDine MCP Server — stdio transport for AI agent integration."""

import json
import sys
from sqlmodel import Session

from app.core.database import engine
from app.services import knowledge_service, menu_service, order_service, reservation_service


def handle_request(request: dict) -> dict:
    method = request.get("method")
    if method == "initialize":
        return {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}, "serverInfo": {"name": "calldine", "version": "1.0.0"}}
    if method == "notifications/initialized":
        return None
    if method == "tools/list":
        return {"tools": [
            {"name": "search-knowledge", "description": "Search restaurant PDFs for hours, location, policies, FAQs.", "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}},
            {"name": "search-menu", "description": "Find available menu items by name or category with price and availability. Use query 'menu' for a general menu question.", "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}},
            {"name": "check-order-items", "description": "Validate order items, stock, and subtotal.", "inputSchema": {"type": "object", "properties": {"items": {"type": "array", "items": {"type": "object", "properties": {"menu_item_id": {"type": "integer"}, "quantity": {"type": "integer"}}, "required": ["menu_item_id", "quantity"]}}}, "required": ["items"]}},
            {"name": "create-order-draft", "description": "Create an unconfirmed delivery order draft.", "inputSchema": {"type": "object", "properties": {"items": {"type": "array", "items": {"type": "object", "properties": {"menu_item_id": {"type": "integer"}, "quantity": {"type": "integer"}}, "required": ["menu_item_id", "quantity"]}}, "delivery_address": {"type": "string"}, "address_confirmed": {"type": "boolean"}}, "required": ["items", "delivery_address", "address_confirmed"]}},
            {"name": "confirm-order", "description": "Confirm a delivery order after customer approval.", "inputSchema": {"type": "object", "properties": {"order_id": {"type": "string"}, "confirmed": {"type": "boolean"}}, "required": ["confirmed"]}},
            {"name": "check-table-availability", "description": "Check available tables for a date, time, and party size.", "inputSchema": {"type": "object", "properties": {"date": {"type": "string"}, "time": {"type": "string"}, "guests": {"type": "integer"}}, "required": ["date", "time", "guests"]}},
            {"name": "create-reservation-draft", "description": "Create an unconfirmed reservation draft.", "inputSchema": {"type": "object", "properties": {"date": {"type": "string"}, "time": {"type": "string"}, "guests": {"type": "integer"}, "customer_name": {"type": "string"}, "phone": {"type": "string"}}, "required": ["date", "time", "guests", "customer_name", "phone"]}},
            {"name": "confirm-reservation", "description": "Confirm a reservation after customer approval.", "inputSchema": {"type": "object", "properties": {"reservation_id": {"type": "string"}, "confirmed": {"type": "boolean"}}, "required": ["confirmed"]}},
        ]}
    if method == "tools/call":
        name = request["params"]["name"]
        args = request["params"].get("arguments", {})
        result = call_tool(name, args)
        return {"content": [{"type": "text", "text": json.dumps(result)}]}
    return {"error": {"code": -32601, "message": f"Unknown method: {method}"}}


def call_tool(name: str, args: dict) -> dict:
    with Session(engine) as session:
        user_id = 1
        if name == "search-knowledge":
            return {"chunks": knowledge_service.search(args["query"])}
        if name == "search-menu":
            return {"items": [item.model_dump() for item in menu_service.search_menu(session, args["query"])]}
        if name == "check-order-items":
            return order_service.check_items(session, args["items"])
        if name == "create-order-draft":
            return order_service.create_draft(session, user_id, args["items"], args["delivery_address"], args["address_confirmed"])
        if name == "confirm-order":
            return order_service.confirm(session, user_id, args.get("order_id"), args["confirmed"])
        if name == "check-table-availability":
            return reservation_service.check(session, args.get("date", ""), args.get("time", ""), args.get("guests", 0))
        if name == "create-reservation-draft":
            return reservation_service.create_draft(session, user_id, args)
        if name == "confirm-reservation":
            return reservation_service.confirm(session, user_id, args.get("reservation_id"), args["confirmed"])
        return {"error": "Unknown tool"}


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        request = json.loads(line)
        response = handle_request(request)
        if response is not None:
            print(json.dumps(response), flush=True)


if __name__ == "__main__":
    main()
