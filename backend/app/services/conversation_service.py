from datetime import datetime

from sqlmodel import Session

from app.models.conversation import ChatMessage, Conversation
from app.repositories import conversation_repository


def create(session: Session, user_id: int, channel: str = "chat") -> Conversation:
    return conversation_repository.save_conversation(session, Conversation(user_id=user_id, channel=channel))


def list_all(session: Session, user_id: int) -> list[Conversation]:
    return conversation_repository.list_conversations(session, user_id)


def get(session: Session, conversation_id: str, user_id: int) -> Conversation | None:
    return conversation_repository.get_conversation(session, conversation_id, user_id)


def save(session: Session, conversation: Conversation) -> Conversation:
    return conversation_repository.save_conversation(session, conversation)


def messages(session: Session, conversation_id: str) -> list[ChatMessage]:
    return conversation_repository.list_messages(session, conversation_id)


def voice_calls(session: Session):
    return [{"id": call.id, "customer_name": customer_name, "title": call.title, "created_at": call.created_at, "updated_at": call.updated_at} for call, customer_name in conversation_repository.list_voice_calls(session)]


def voice_call(session: Session, conversation_id: str) -> Conversation | None:
    return conversation_repository.get_voice_call(session, conversation_id)


def add_message(session: Session, conversation: Conversation, role: str, content: str) -> ChatMessage:
    if conversation.title == "New conversation" and role == "user":
        conversation.title = content[:48]
    conversation.updated_at = datetime.utcnow()
    conversation_repository.save_conversation(session, conversation)
    return conversation_repository.save_message(session, ChatMessage(conversation_id=conversation.id, role=role, content=content))
