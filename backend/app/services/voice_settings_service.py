from sqlmodel import Session

from app.config import get_settings
from app.models.voice_settings import VoiceSettings
from app.repositories import voice_settings_repository


def get(session: Session) -> VoiceSettings:
    return voice_settings_repository.get(session) or voice_settings_repository.save(session, VoiceSettings(polly_voice_id=get_settings().polly_voice_id))


def update(session: Session, voice_id: str) -> VoiceSettings:
    settings = get(session)
    settings.polly_voice_id = voice_id
    return voice_settings_repository.save(session, settings)
