from collections.abc import Iterator
import re

from sqlmodel import Session

from app.aws.bedrock_client import get_bedrock_client
from app.models.conversation import Conversation
from app.services.chat_tools import TOOL_CONFIG, run_tool
from app.services import conversation_service

MODEL_ID = "openai.gpt-oss-20b-1:0"
ROUTER_PROMPT = """You are the CallDine tool planner. Ask for missing details one question at a time. Use search_menu for menu questions and search_knowledge for restaurant facts. For delivery, collect items and quantities, then a full address; repeat the address and ask if it is correct before create_order_draft. Repeat the final order before confirm_order. For reservations, collect date, time, guests, name, and phone; check availability, repeat the summary, then confirm. Never call either confirm tool without a clear customer yes. Choose all independent tools needed now, but do not answer the customer yourself."""
ANSWER_PROMPT = "You are CallDine, a helpful restaurant assistant. Answer warmly and concisely using the tool result. Ask for only the next missing detail. Do not use a confirmation tool unless the customer clearly agreed."
VOICE_PROMPT = "You are CallDine, a helpful restaurant voice assistant. Use short natural sentences. Never use Markdown, asterisks, headings, tables, pipes, or bullet symbols."


def stream(response: dict) -> Iterator[str]:
    for event in response["stream"]:
        delta = event.get("contentBlockDelta", {}).get("delta", {})
        if "text" in delta:
            yield delta["text"]


def clean_for_speech(text: str) -> str:
    text = re.sub(r"\*\*(.*?)\*\*|_(.*?)_", lambda match: match.group(1) or match.group(2), text)
    text = re.sub(r"^#{1,3}\s*|^\s*[-*]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\|[-| :]+\|$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*,\s*", ", ", text.replace("|", ", "))
    return re.sub(r"\n{2,}", ". ", text).strip()


def stream_reply(session: Session, user_id: int, conversation: Conversation, message: str) -> Iterator[str]:
    client = get_bedrock_client()
    conversation_service.add_message(session, conversation, "user", message)
    messages = [{"role": item.role, "content": [{"text": item.content}]} for item in conversation_service.messages(session, conversation.id)]
    choice = client.converse(
        modelId=MODEL_ID,
        system=[{"text": ROUTER_PROMPT}],
        messages=messages,
        toolConfig=TOOL_CONFIG,
    )
    if choice["stopReason"] != "tool_use":
        answer = ""
        for text in stream(client.converse_stream(
            modelId=MODEL_ID, system=[{"text": ANSWER_PROMPT}], messages=messages
        )):
            answer += text
            yield text
        conversation_service.add_message(session, conversation, "assistant", answer)
        return
    tool_results = []
    for block in choice["output"]["message"]["content"]:
        if "toolUse" in block:
            tool_use = block["toolUse"]
            result = run_tool(session, user_id, tool_use["name"], tool_use["input"])
            tool_results.append({"toolResult": {"toolUseId": tool_use["toolUseId"], "content": [{"json": result}]}})
    messages.extend([
        choice["output"]["message"],
        {"role": "user", "content": tool_results},
    ])
    answer = ""
    for text in stream(client.converse_stream(
        modelId=MODEL_ID,
        system=[{"text": ANSWER_PROMPT}],
        messages=messages,
        toolConfig=TOOL_CONFIG,
    )):
        answer += text
        yield text
    conversation_service.add_message(session, conversation, "assistant", answer)
