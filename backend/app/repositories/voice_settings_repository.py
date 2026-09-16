from sqlmodel import Session

from app.models.voice_settings import VoiceSettings


def get(session: Session) -> VoiceSettings | None:
    return session.get(VoiceSettings, 1)


def save(session: Session, settings: VoiceSettings) -> VoiceSettings:
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings
