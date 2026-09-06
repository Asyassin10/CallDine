import asyncio
from collections.abc import Iterator
from uuid import uuid4

from fastapi import UploadFile
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from amazon_transcribe.model import TranscriptEvent

from app.aws.chime_client import get_chime_client
from app.aws.polly_client import get_polly_client
from app.aws.s3_client import get_s3_client
from app.aws.transcribe_client import get_transcribe_client
from app.config import get_settings
from app.services import conversation_service, voice_settings_service
from app.services.chat_service import clean_for_speech


def start_session(session, user_id: int) -> dict:
    settings = get_settings()
    meeting = get_chime_client().create_meeting(ClientRequestToken=str(uuid4()), ExternalMeetingId=f"calldine-{uuid4()}", MediaRegion=settings.chime_media_region)["Meeting"]
    attendee = get_chime_client().create_attendee(MeetingId=meeting["MeetingId"], ExternalUserId=f"customer-{user_id}-{uuid4()}")["Attendee"]
    conversation = conversation_service.create(session, user_id, "voice")
    return {"meeting": meeting, "attendee": attendee, "conversation_id": conversation.id}


class TranscriptHandler(TranscriptResultStreamHandler):
    def __init__(self, stream):
        super().__init__(stream)
        self.parts: list[str] = []

    async def handle_transcript_event(self, event: TranscriptEvent) -> None:
        for result in event.transcript.results:
            if not result.is_partial and result.alternatives:
                self.parts.append(result.alternatives[0].transcript)


async def transcribe(file: UploadFile, sample_rate: int) -> str:
    audio = await file.read()
    stream = await get_transcribe_client().start_stream_transcription(
        language_code="en-US", media_sample_rate_hz=sample_rate, media_encoding="pcm",
        enable_partial_results_stabilization=True, partial_results_stability="high",
    )
    handler = TranscriptHandler(stream.output_stream)
    async def send_audio() -> None:
        for offset in range(0, len(audio), 8192):
            await stream.input_stream.send_audio_event(audio_chunk=audio[offset:offset + 8192])
        await stream.input_stream.end_stream()
    await asyncio.gather(send_audio(), handler.handle_events())
    return " ".join(handler.parts)


def save_recording(session, conversation, file: UploadFile) -> None:
    key = f"audios/calls/{conversation.id}.webm"
    get_s3_client().upload_fileobj(file.file, get_settings().s3_bucket, key, ExtraArgs={"ContentType": "audio/webm"})
    conversation.audio_key = key
    conversation_service.save(session, conversation)


def recording(key: str, byte_range: str | None = None):
    request = {"Bucket": get_settings().s3_bucket, "Key": key}
    if byte_range:
        request["Range"] = byte_range
    result = get_s3_client().get_object(**request)
    headers = {"Accept-Ranges": "bytes", "Content-Length": str(result["ContentLength"])}
    if result.get("ContentRange"):
        headers["Content-Range"] = result["ContentRange"]
    return result["Body"], result.get("ContentType", "audio/webm"), headers


def speech(session, text: str) -> Iterator[bytes]:
    settings = get_settings()
    text = clean_for_speech(text)
    audio = get_polly_client().synthesize_speech(Text=text, OutputFormat="mp3", VoiceId=voice_settings_service.get(session).polly_voice_id, Engine="neural")["AudioStream"]
    try:
        while chunk := audio.read(8192):
            yield chunk
    finally:
        audio.close()
