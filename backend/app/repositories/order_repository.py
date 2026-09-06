from sqlmodel import Session, select

from app.models.order import Order, OrderItem
from app.models.user import User


def save_order(session: Session, order: Order) -> Order:
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


def get_order(session: Session, order_id: str, user_id: int) -> Order | None:
    return session.exec(select(Order).where(Order.id == order_id, Order.user_id == user_id)).first()


def latest_draft(session: Session, user_id: int) -> Order | None:
    return session.exec(select(Order).where(Order.user_id == user_id, Order.status == "draft").order_by(Order.created_at.desc())).first()


def list_confirmed(session: Session, user_id: int) -> list[Order]:
    return list(session.exec(select(Order).where(Order.user_id == user_id, Order.status == "confirmed").order_by(Order.created_at.desc())))


def list_all_confirmed(session: Session):
    return list(session.exec(select(Order, User.name).join(User, User.id == Order.user_id).where(Order.status == "confirmed").order_by(Order.created_at.desc())).all())


def save_items(session: Session, items: list[OrderItem]) -> None:
    session.add_all(items)
    session.commit()


def list_items(session: Session, order_id: str) -> list[OrderItem]:
    return list(session.exec(select(OrderItem).where(OrderItem.order_id == order_id)))
