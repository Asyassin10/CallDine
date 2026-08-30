from fastapi import APIRouter, Header, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.deps import SessionDep
from app.api.routes_auth import bearer_token
from app.models.user import UserRole
from app.schemas.chat_schema import ChatMessageResponse, ChatRequest, ConversationResponse
from app.services import auth_service, chat_service, conversation_service

router = APIRouter(prefix="/api/v1/conversations", tags=["conversations"])


def customer(session: SessionDep, authorization: str | None):
    user = auth_service.current_user(session, bearer_token(authorization))
    if not user or user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer login required")
    return user


@router.get("", response_model=list[ConversationResponse])
def list_conversations(session: SessionDep, authorization: str | None = Header(default=None)):
    user = customer(session, authorization)
    return conversation_service.list_all(session, user.id)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(session: SessionDep, authorization: str | None = Header(default=None)):
    user = customer(session, authorization)
    return conversation_service.create(session, user.id)


@router.get("/{conversation_id}/messages", response_model=list[ChatMessageResponse])
def list_messages(conversation_id: str, session: SessionDep, authorization: str | None = Header(default=None)):
    user = customer(session, authorization)
    if not conversation_service.get(session, conversation_id, user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation_service.messages(session, conversation_id)


@router.post("/{conversation_id}/messages/stream")
def stream_message(conversation_id: str, payload: ChatRequest, session: SessionDep, authorization: str | None = Header(default=None)) -> StreamingResponse:
    user = customer(session, authorization)
    conversation = conversation_service.get(session, conversation_id, user.id)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return StreamingResponse(chat_service.stream_reply(session, user.id, conversation, payload.message), media_type="text/plain")
