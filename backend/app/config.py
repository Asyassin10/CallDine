"""Runtime configuration loaded from environment variables."""

from dataclasses import dataclass
from functools import lru_cache
import os

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Application settings shared across the backend."""

    app_name: str
    environment: str
    frontend_origins: list[str]
    aws_region: str
    bedrock_guardrail_id: str
    bedrock_guardrail_version: str
    s3_bucket: str
    s3_access_point: str
    qdrant_url: str
    qdrant_collection: str
    polly_voice_id: str
    chime_media_region: str


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings without storing secrets in source."""

    origins = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://localhost:3010",
    )
    return Settings(
        app_name=os.getenv("APP_NAME", "CallDine AI Backend"),
        environment=os.getenv("ENVIRONMENT", "development"),
        frontend_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
        aws_region=os.getenv("AWS_REGION", ""),
        bedrock_guardrail_id=os.getenv("BEDROCK_GUARDRAIL_ID", ""),
        bedrock_guardrail_version=os.getenv("BEDROCK_GUARDRAIL_VERSION", ""),
        s3_bucket=os.getenv("S3_BUCKET", ""),
        s3_access_point=os.getenv("S3_ACCESS_POINT", ""),
        qdrant_url=os.getenv("QDRANT_URL", "http://localhost:6333"),
        qdrant_collection=os.getenv("QDRANT_COLLECTION", "knowledge"),
        polly_voice_id=os.getenv("POLLY_VOICE_ID", "Joanna"),
        chime_media_region=os.getenv("CHIME_MEDIA_REGION", os.getenv("AWS_REGION", "us-east-1")),
    )
