from datetime import datetime

from pydantic import BaseModel


class VoiceSessionResponse(BaseModel):
    meeting: dict
    attendee: dict
    conversation_id: str


class AdminVoiceCallResponse(BaseModel):
    id: str
    customer_name: str
    title: str
    created_at: datetime
    updated_at: datetime


class SpeechRequest(BaseModel):
    text: str


class VoiceSettingsRequest(BaseModel):
    polly_voice_id: str


class VoiceSettingsResponse(BaseModel):
    polly_voice_id: str
