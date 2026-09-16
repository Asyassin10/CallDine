from sqlmodel import Session, select

from app.models.reservation import Reservation, RestaurantTable


def save_reservation(session: Session, reservation: Reservation) -> Reservation:
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    return reservation


def get_reservation(session: Session, reservation_id: str, user_id: int) -> Reservation | None:
    return session.exec(select(Reservation).where(Reservation.id == reservation_id, Reservation.user_id == user_id)).first()


def latest_draft(session: Session, user_id: int) -> Reservation | None:
    return session.exec(select(Reservation).where(Reservation.user_id == user_id, Reservation.status == "draft").order_by(Reservation.created_at.desc())).first()


def list_confirmed(session: Session, user_id: int) -> list[Reservation]:
    return list(session.exec(select(Reservation).where(Reservation.user_id == user_id, Reservation.status == "confirmed").order_by(Reservation.date, Reservation.time)))


def list_all_confirmed(session: Session) -> list[Reservation]:
    return list(session.exec(select(Reservation).where(Reservation.status == "confirmed").order_by(Reservation.date, Reservation.time)))


def get_by_id(session: Session, reservation_id: str) -> Reservation | None:
    return session.get(Reservation, reservation_id)


def confirmed_for_date(session: Session, date: str) -> list[Reservation]:
    return list(session.exec(select(Reservation).where(Reservation.date == date, Reservation.status == "confirmed")))


def list_tables(session: Session) -> list[RestaurantTable]:
    return list(session.exec(select(RestaurantTable).where(RestaurantTable.active == True).order_by(RestaurantTable.code)))


def seed_tables(session: Session) -> None:
    if session.exec(select(RestaurantTable)).first():
        return
    tables = [RestaurantTable(code=f"T{number}", capacity=2 if number <= 4 else 4 if number <= 10 else 6) for number in range(1, 13)]
    session.add_all(tables)
    session.commit()
