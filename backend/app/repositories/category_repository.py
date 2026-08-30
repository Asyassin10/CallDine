"""Category database queries only."""

from sqlmodel import Session, select

from app.models.category import Category


def list_all(session: Session) -> list[Category]:
    return list(session.exec(select(Category).order_by(Category.name)))


def get_by_name(session: Session, name: str) -> Category | None:
    return session.exec(select(Category).where(Category.name == name)).first()


def save(session: Session, category: Category) -> Category:
    session.add(category)
    session.commit()
    session.refresh(category)
    return category
