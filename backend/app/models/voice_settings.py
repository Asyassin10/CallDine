from sqlmodel import Field, SQLModel


class VoiceSettings(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)
    polly_voice_id: str = "Joanna"
