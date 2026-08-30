from datetime import datetime, timedelta

from sqlmodel import Session

from app.models.reservation import Reservation
from app.repositories import reservation_repository


def available_tables(session: Session, date: str, time: str, guests: int) -> list[str]:
    start = datetime.fromisoformat(f"{date}T{time}")
    end = start + timedelta(hours=2)
    busy = []
    for reservation in reservation_repository.confirmed_for_date(session, date):
        booked_start = datetime.fromisoformat(f"{reservation.date}T{reservation.time}")
        if start < booked_start + timedelta(hours=2) and booked_start < end:
            busy.append(reservation.table_code)
    return [table.code for table in reservation_repository.list_tables(session) if table.capacity >= guests and table.code not in busy]


def check(session: Session, date: str, time: str, guests: int) -> dict:
    tables = available_tables(session, date, time, guests)
    return {"available": bool(tables), "tables": tables}


def create_draft(session: Session, user_id: int, values: dict) -> dict:
    tables = available_tables(session, values["date"], values["time"], int(values["guests"]))
    if not tables:
        return {"available": False}
    reservation = reservation_repository.save_reservation(session, Reservation(user_id=user_id, customer_name=values["customer_name"], phone=values["phone"], date=values["date"], time=values["time"], guests=int(values["guests"])))
    return {"available": True, "reservation_id": reservation.id, "table": tables[0]}


def confirm(session: Session, user_id: int, reservation_id: str, confirmed: bool) -> dict:
    reservation = reservation_repository.get_reservation(session, reservation_id, user_id)
    if not reservation or not confirmed:
        return {"confirmed": False}
    tables = available_tables(session, reservation.date, reservation.time, reservation.guests)
    if not tables:
        return {"confirmed": False, "message": "That table time is no longer available."}
    reservation.table_code, reservation.status = tables[0], "confirmed"
    reservation_repository.save_reservation(session, reservation)
    return {"confirmed": True, "reservation_id": reservation.id, "table": reservation.table_code}


def list_confirmed(session: Session, user_id: int) -> list[Reservation]:
    return reservation_repository.list_confirmed(session, user_id)
