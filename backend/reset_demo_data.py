"""Remove demo orders and reservations while keeping users, menu items, and tables."""

from sqlmodel import Session, delete

from app.core.database import engine
from app.models.order import Order, OrderItem
from app.models.reservation import Reservation


with Session(engine) as session:
    session.exec(delete(OrderItem))
    session.exec(delete(Order))
    session.exec(delete(Reservation))
    session.commit()

print("Demo orders and reservations removed.")
