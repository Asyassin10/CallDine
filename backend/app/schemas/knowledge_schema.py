"""Knowledge base API response shapes."""

from datetime import datetime

from sqlmodel import SQLModel


class KnowledgeEntryResponse(SQLModel):
    id: int
    title: str
    s3_key: str
    created_at: datetime
    status: str
    progress: int
    message: str
