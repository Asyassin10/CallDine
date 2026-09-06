"""SQLite and SQLModel setup."""

from collections.abc import Generator
from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy import text

from app.models.category import Category
from app.models.conversation import ChatMessage, Conversation
from app.models.dashboard_metric import DashboardMetric
from app.models.knowledge import KnowledgeEntry
from app.models.knowledge_job import KnowledgeJob
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem
from app.models.reservation import Reservation, RestaurantTable
from app.models.user import User
from app.models.voice_settings import VoiceSettings

DATABASE_PATH = Path(__file__).resolve().parents[2] / "calldine.db"
engine = create_engine(f"sqlite:///{DATABASE_PATH}", connect_args={"check_same_thread": False})


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)
    with engine.begin() as connection:
        columns = [row[1] for row in connection.execute(text("PRAGMA table_info(menuitem)"))]
        if "stock_quantity" not in columns:
            connection.execute(text("ALTER TABLE menuitem ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 20"))
        conversation_columns = [row[1] for row in connection.execute(text("PRAGMA table_info(conversation)"))]
        if "channel" not in conversation_columns:
            connection.execute(text("ALTER TABLE conversation ADD COLUMN channel TEXT NOT NULL DEFAULT 'chat'"))
        if "audio_key" not in conversation_columns:
            connection.execute(text("ALTER TABLE conversation ADD COLUMN audio_key TEXT"))


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
