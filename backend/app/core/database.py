"""SQLite and SQLModel setup."""

from collections.abc import Generator
from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine

from app.models.category import Category
from app.models.menu import MenuItem
from app.models.user import User

DATABASE_PATH = Path(__file__).resolve().parents[2] / "calldine.db"
engine = create_engine(f"sqlite:///{DATABASE_PATH}", connect_args={"check_same_thread": False})


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
