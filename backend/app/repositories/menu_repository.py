"""Menu item database queries only."""

from sqlmodel import Session, select

from app.models.category import Category
from app.models.menu import MenuItem


def has_items(session: Session) -> bool:
    return session.exec(select(MenuItem)).first() is not None


def list_all(session: Session) -> list[tuple[MenuItem, Category]]:
    query = select(MenuItem, Category).join(Category, MenuItem.category_id == Category.id).order_by(MenuItem.name)
    return list(session.exec(query))


def get_by_id(session: Session, item_id: int) -> MenuItem | None:
    return session.get(MenuItem, item_id)


def search(session: Session, query: str) -> list[tuple[MenuItem, Category]]:
    term = f"%{query.lower()}%"
    statement = select(MenuItem, Category).join(Category, MenuItem.category_id == Category.id).where(
        MenuItem.name.ilike(term) | Category.name.ilike(term)
    ).order_by(MenuItem.name)
    return list(session.exec(statement))


def save(session: Session, item: MenuItem) -> MenuItem:
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete(session: Session, item: MenuItem) -> None:
    session.delete(item)
    session.commit()
