from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from app.api.deps import SessionDep
from app.api.routes_auth import bearer_token
from app.schemas.voice_schema import SpeechRequest, VoiceSessionResponse
from app.services import auth_service, voice_service

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


def user_id(session: SessionDep, authorization: str | None) -> int:
    user = auth_service.current_user(session, bearer_token(authorization))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")
    return user.id


@router.post("/session", response_model=VoiceSessionResponse)
def session(session: SessionDep, authorization: str | None = Header(default=None)):
    return voice_service.start_session(session, user_id(session, authorization))


@router.post("/transcribe")
async def transcribe(session: SessionDep, file: UploadFile = File(...), sample_rate: int = Form(...), authorization: str | None = Header(default=None)):
    user_id(session, authorization)
    return {"text": await voice_service.transcribe(file, sample_rate)}


@router.post("/recording/{conversation_id}")
def recording(conversation_id: str, session: SessionDep, file: UploadFile = File(...), authorization: str | None = Header(default=None)):
    conversation = conversation_service.get(session, conversation_id, user_id(session, authorization))
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice call not found")
    voice_service.save_recording(session, conversation, file)
    return {"saved": True}


@router.post("/speech")
def speech(payload: SpeechRequest, session: SessionDep, authorization: str | None = Header(default=None)):
    user_id(session, authorization)
    return StreamingResponse(voice_service.speech(session, payload.text), media_type="audio/mpeg")
