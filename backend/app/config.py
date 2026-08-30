"""Runtime configuration loaded from environment variables."""

from dataclasses import dataclass
from functools import lru_cache
import os


@dataclass(frozen=True)
class Settings:
    """Application settings shared across the backend."""

    app_name: str
    environment: str
    frontend_origins: list[str]


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
    )
