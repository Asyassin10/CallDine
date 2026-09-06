from collections.abc import Iterator
from datetime import date
import re

from sqlmodel import Session

from app.aws.bedrock_client import get_bedrock_client
from app.config import get_settings
from app.models.conversation import Conversation
from app.services.chat_tools import TOOL_CONFIG, run_tool
from app.services import conversation_service

MODEL_ID = "openai.gpt-oss-20b-1:0"
ROUTER_PROMPT = """You are the CallDine tool planner. Previous messages are the customer's memory: never ask again for information already provided. Ask for only one missing detail at a time and never guess. Use search-menu for current menu, price, availability, or stock; use search-knowledge for restaurant facts. For delivery, collect items and every quantity, then offer a drink exactly once before asking for a missing address. Skip the offer if the order already has a Boissons item or the customer already accepted or declined drinks. If the customer accepts without naming a drink, use search-menu with query Boissons. Collect the chosen drink and quantity, then continue with any missing address details. Repeat the complete address and ask if it is correct before create-order-draft. Then repeat items, quantities, address, and total before confirm-order. For reservations, collect date, time, guests, name, and phone; check availability; repeat the booking summary before confirm-reservation. Never call either confirmation tool without a clear customer yes, confirm, or equivalent. Choose all independent tools needed now, but do not answer the customer yourself."""
ANSWER_PROMPT = """You are CallDine, a helpful restaurant assistant. Tool execution is already complete. Do not call any tool now: write the final customer-facing response only. Use the complete saved conversation as memory and tool results as the source of truth. Answer warmly and concisely. Ask only the next missing detail; never guess or repeat a detail the customer already gave. For delivery, after food items and quantities are known, offer a drink exactly once before asking for a missing address. Do not offer again when a Boissons item is already included or the customer previously accepted or declined. Collect any accepted drink and its quantity before continuing. Repeat the full address and ask the customer to confirm it before creating a draft. For a reservation, do not ask the customer to choose a table; the restaurant assigns a suitable table after confirmation. Before confirming an order or reservation, repeat the complete summary and ask for explicit approval."""
VOICE_PROMPT = """This is a voice conversation. Customer-facing answers must be short, natural plain text. Never use Markdown, tables, headings, bullets, emojis, parentheses, or formatting symbols. Never say or display menu item IDs, order IDs, reservation IDs, table IDs, UUIDs, tool names, or database fields. IDs may be used only inside tool inputs. Describe menu results naturally using dish names and prices."""
BLOCKED_MESSAGE = "I'm sorry, but I can't help with that request."


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
    if choice["stopReason"] != "tool_use":
        answer = ""
        for text in stream(client.converse_stream(
            modelId=MODEL_ID, system=[{"text": answer_prompt}], messages=messages,
            **guardrail_request(),
        )):
            answer += text
            if not voice:
                yield text
        if voice:
            answer = clean_for_speech(answer)
            yield answer
        conversation_service.add_message(session, conversation, "assistant", answer)
        return
    for _ in range(4):
        messages.extend([choice["output"]["message"], {"role": "user", "content": tool_results(session, user_id, choice["output"]["message"])}])
        choice = client.converse(modelId=MODEL_ID, system=[{"text": answer_prompt}], messages=messages, toolConfig=TOOL_CONFIG, **guardrail_request())
        if choice["stopReason"] == "guardrail_intervened":
            answer = guardrail_text(choice)
            yield answer
            conversation_service.add_message(session, conversation, "assistant", answer)
            return
        if choice["stopReason"] != "tool_use":
            break
    answer = response_text(choice["output"]["message"])
    if voice:
        answer = clean_for_speech(answer)
    yield answer
    conversation_service.add_message(session, conversation, "assistant", answer)
