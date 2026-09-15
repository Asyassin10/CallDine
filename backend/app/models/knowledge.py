"""Knowledge base database table."""

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class KnowledgeEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    s3_key: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
