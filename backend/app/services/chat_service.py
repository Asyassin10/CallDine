from collections.abc import Iterator
from datetime import date, datetime
import json
import re

from sqlmodel import Session

from app.aws.bedrock_client import get_bedrock_client
from app.config import get_settings
from app.models.conversation import Conversation
from app.services.chat_tools import TOOL_CONFIG, run_tool
from app.services import conversation_service
from app.services.prompts import ROUTER_PROMPT, ANSWER_PROMPT, VOICE_PROMPT, BLOCKED_MESSAGE

MODEL_ID = "openai.gpt-oss-20b-1:0"
TOOL_NAMES = {item["toolSpec"]["name"] for item in TOOL_CONFIG["tools"]}


def guardrail_request() -> dict:
    settings = get_settings()
    if not settings.bedrock_guardrail_id or not settings.bedrock_guardrail_version:
        return {}
    return {"guardrailConfig": {
        "guardrailIdentifier": settings.bedrock_guardrail_id,
        "guardrailVersion": settings.bedrock_guardrail_version,
    }}


def stream(response: dict) -> Iterator[str]:
    has_text = False
    for event in response["stream"]:
        delta = event.get("contentBlockDelta", {}).get("delta", {})
        if "text" in delta:
            has_text = True
            yield delta["text"]
        if event.get("messageStop", {}).get("stopReason") == "guardrail_intervened" and not has_text:
            yield BLOCKED_MESSAGE


def tool_results(session: Session, user_id: int, message: dict) -> list[dict]:
    results = []
    for block in message["content"]:
        if "toolUse" in block:
            tool_use = block["toolUse"]
            result = run_tool(session, user_id, tool_use["name"], tool_use["input"])
            results.append({"toolResult": {"toolUseId": tool_use["toolUseId"], "content": [{"json": result}]}})
    return results


def normalize_tool_names(message: dict) -> dict:
    for block in message["content"]:
        if "toolUse" not in block:
            continue
        value = block["toolUse"]["name"].strip().replace("-", "_")
        block["toolUse"]["name"] = next((name for name in TOOL_NAMES if name in value), re.sub(r"[^a-zA-Z0-9_-]", "_", value))
    return message


def pending_reservation_reply(completed_tools: list[dict]) -> str | None:
    confirmed = any(item["name"] == "confirm_reservation" and item["result"].get("confirmed") is True for item in completed_tools)
    draft = next((item["result"] for item in reversed(completed_tools) if item["name"] == "create_reservation_draft" and item["result"].get("reservation_id")), None)
    if not draft or confirmed:
        return None
    time = datetime.strptime(draft["time"], "%H:%M").strftime("%I:%M %p").lstrip("0")
    return f"I have a table for {draft['guests']} people on {draft['date']} at {time}, under {draft['customer_name']}. Please say confirm to book it."


def pending_order_reply(completed_tools: list[dict]) -> str | None:
    confirmed = any(item["name"] == "confirm_order" and item["result"].get("confirmed") is True for item in completed_tools)
    draft = next((item["result"] for item in reversed(completed_tools) if item["name"] == "create_order_draft" and item["result"].get("order_id")), None)
    if not draft or confirmed:
        return None
    items = ", ".join(f"{item['quantity']} {item['name']}" for item in draft["items"])
    return f"I have {items} for delivery to {draft['delivery_address']}. The total is {draft['total']:.2f} euros. Please say confirm to place the order."


def response_text(message: dict) -> str:
    return "".join(block.get("text", "") for block in message["content"])


def guardrail_text(choice: dict) -> str:
    message = choice.get("output", {}).get("message")
    text = response_text(message) if message else ""
    return text or BLOCKED_MESSAGE


def clean_for_speech(text: str) -> str:
    text = re.sub(r"[\U0001F000-\U0001FAFF\u2600-\u27BF]", "", text)
    text = re.sub(r"\s*\(?\b(?:menu item|item|order|reservation|table)?\s*ID\s*[:#]?\s*[\w-]+\)?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\*\*(.*?)\*\*|_(.*?)_", lambda match: match.group(1) or match.group(2), text)
    text = re.sub(r"^#{1,3}\s*|^\s*[-*]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\|[-| :]+\|$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*,\s*", ", ", text.replace("|", ", "))
    return re.sub(r"\n{2,}", ". ", text).strip()


def stream_reply(session: Session, user_id: int, conversation: Conversation, message: str) -> Iterator[str]:
    client = get_bedrock_client()
    voice = conversation.channel == "voice"
    router_prompt = f"{ROUTER_PROMPT}\n{VOICE_PROMPT}" if voice else ROUTER_PROMPT
    answer_prompt = f"{ANSWER_PROMPT}\n{VOICE_PROMPT}" if voice else ANSWER_PROMPT
    conversation_service.add_message(session, conversation, "user", message)
    messages = [{"role": item.role, "content": [{"text": item.content}]} for item in conversation_service.messages(session, conversation.id)]
    conversation_messages = list(messages)
    completed_tools = []
    choice = client.converse(
        modelId=MODEL_ID,
        system=[{"text": f"{router_prompt}\nToday's restaurant date is {date.today().isoformat()}. Interpret relative dates such as tomorrow from this date."}],
        messages=messages,
        toolConfig=TOOL_CONFIG,
        **guardrail_request(),
    )
    if choice["stopReason"] == "guardrail_intervened":
        answer = guardrail_text(choice)
        yield answer
        conversation_service.add_message(session, conversation, "assistant", answer)
        return
    for _ in range(4):
        if choice["stopReason"] != "tool_use":
            break
        planner_message = normalize_tool_names(choice["output"]["message"])
        results = tool_results(session, user_id, planner_message)
        tool_uses = [block["toolUse"] for block in planner_message["content"] if "toolUse" in block]
        completed_tools.extend({"name": tool_use["name"], "result": result["toolResult"]["content"][0]["json"]} for tool_use, result in zip(tool_uses, results))
        messages.extend([planner_message, {"role": "user", "content": results}])
        choice = client.converse(modelId=MODEL_ID, system=[{"text": f"{router_prompt}\nToday's restaurant date is {date.today().isoformat()}."}], messages=messages, toolConfig=TOOL_CONFIG, **guardrail_request())
        if choice["stopReason"] == "guardrail_intervened":
            answer = guardrail_text(choice)
            yield answer
            conversation_service.add_message(session, conversation, "assistant", answer)
            return
    answer = ""
    for text in stream(client.converse_stream(
        modelId=MODEL_ID,
        system=[{"text": f"{answer_prompt}\nCompleted tool results: {json.dumps(completed_tools)}"}],
        messages=conversation_messages,
        **guardrail_request(),
    )):
        answer += text
    if not answer.strip():
        answer = "I'm sorry, I couldn't complete that request. Please try again."
    answer = pending_reservation_reply(completed_tools) or pending_order_reply(completed_tools) or answer
    if voice:
        answer = clean_for_speech(answer)
    yield answer
    conversation_service.add_message(session, conversation, "assistant", answer)