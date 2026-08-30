"""Qdrant client configuration."""

from qdrant_client import QdrantClient

from app.config import get_settings


def get_qdrant_client() -> QdrantClient:
    return QdrantClient(url=get_settings().qdrant_url)
