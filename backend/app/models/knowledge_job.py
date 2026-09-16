"""Knowledge processing queue table."""

from sqlmodel import Field, SQLModel


class KnowledgeJob(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    entry_id: int = Field(index=True, unique=True)
    status: str = "queued"
    progress: int = 0
    message: str = "Waiting to process"
