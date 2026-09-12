from fastapi import APIRouter, Header, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.deps import SessionDep
from app.api.routes_auth import bearer_token
from app.models.user import UserRole
from app.schemas.customer_schema import AdminOrderResponse
from app.schemas.dashboard_schema import DashboardResponse
from app.schemas.chat_schema import ChatMessageResponse
from app.schemas.voice_schema import AdminVoiceCallResponse, VoiceSettingsRequest, VoiceSettingsResponse
from app.services import auth_service, conversation_service, dashboard_service, order_service, voice_settings_service, voice_service

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def admin(session: SessionDep, authorization: str | None):
    user = auth_service.current_user(session, bearer_token(authorization))
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin login required")
    return user


@router.get("/orders", response_model=list[AdminOrderResponse])
def orders(session: SessionDep, authorization: str | None = Header(default=None)):
    admin(session, authorization)
    return order_service.list_all_confirmed(session)


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(session: SessionDep, authorization: str | None = Header(default=None)):
    admin(session, authorization)
    return dashboard_service.dashboard(session)


@router.get("/calls", response_model=list[AdminVoiceCallResponse])
def calls(session: SessionDep, authorization: str | None = Header(default=None)):
    admin(session, authorization)
    return conversation_service.voice_calls(session)


@router.get("/calls/{conversation_id}", response_model=list[ChatMessageResponse])
def call_messages(conversation_id: str, session: SessionDep, authorization: str | None = Header(default=None)):
    admin(session, authorization)
    if not conversation_service.voice_call(session, conversation_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice call not found")
    return conversation_service.messages(session, conversation_id)


@router.get("/calls/{conversation_id}/audio")
def call_audio(conversation_id: str, session: SessionDep, authorization: str | None = Header(default=None), byte_range: str | None = Header(default=None, alias="Range")):
    admin(session, authorization)
    call = conversation_service.voice_call(session, conversation_id)
    if not call or not call.audio_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording not found")
    audio, content_type, headers = voice_service.recording(call.audio_key, byte_range)
    headers["Content-Disposition"] = 'inline; filename="call.webm"'
    headers["Cache-Control"] = "private, no-store"
    return StreamingResponse(audio, status_code=206 if byte_range else 200, media_type=content_type, headers=headers)


@router.get("/voice-settings", response_model=VoiceSettingsResponse)
def voice_settings(session: SessionDep, authorization: str | None = Header(default=None)):
    admin(session, authorization)
    return voice_settings_service.get(session)


@router.patch("/voice-settings", response_model=VoiceSettingsResponse)
def update_voice_settings(payload: VoiceSettingsRequest, session: SessionDep, authorization: str | None = Header(default=None)):
    admin(session, authorization)
    if payload.polly_voice_id not in {"Joanna", "Matthew"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Choose Joanna or Matthew")
    return voice_settings_service.update(session, payload.polly_voice_id)
