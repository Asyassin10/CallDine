from amazon_transcribe.client import TranscribeStreamingClient

from app.config import get_settings


def get_transcribe_client():
    return TranscribeStreamingClient(region=get_settings().aws_region)
