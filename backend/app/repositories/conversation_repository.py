from sqlmodel import Session, select

from app.models.conversation import ChatMessage, Conversation


def save_conversation(session: Session, conversation: Conversation) -> Conversation:
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def get_conversation(session: Session, conversation_id: str, user_id: int) -> Conversation | None:
    return session.exec(select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)).first()


def list_conversations(session: Session, user_id: int) -> list[Conversation]:
    return list(session.exec(select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc())))


def save_message(session: Session, message: ChatMessage) -> ChatMessage:
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


def list_messages(session: Session, conversation_id: str) -> list[ChatMessage]:
    return list(session.exec(select(ChatMessage).where(ChatMessage.conversation_id == conversation_id).order_by(ChatMessage.id)))
