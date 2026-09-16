from datetime import datetime, timedelta
import re

from sqlmodel import Session

from app.models.reservation import Reservation
from app.repositories import reservation_repository


def normalize_date(value: str) -> str:
    relative = value.strip().lower()
    if relative in {"today", "tonight"}:
        return datetime.now().date().isoformat()
    if relative == "tomorrow":
        return (datetime.now().date() + timedelta(days=1)).isoformat()
    return value


def normalize_time(value: str) -> str:
    value = value.strip().lower().replace(".", "")
    for pattern in ("%H:%M", "%H", "%I %p", "%I:%M %p", "%I%p", "%I:%M%p"):
        try:
            return datetime.strptime(value, pattern).strftime("%H:%M")
        except ValueError:
            pass
    return value


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
    missing = [name for name, value in {"date": date, "time": time, "guests": guests}.items() if not value]
    if missing:
        return {"available": False, "missing": missing, "message": "Ask the customer for the missing reservation details."}
    try:
        date = normalize_date(date)
        time = normalize_time(time)
        tables = available_tables(session, date, time, guests)
    except ValueError:
        return {"available": False, "message": "Ask the customer for the reservation date in YYYY-MM-DD format and a time such as 20:30."}
    return {"available": bool(tables), "tables": tables}


def create_draft(session: Session, user_id: int, values: dict) -> dict:
    name, phone = values["customer_name"].strip(), values["phone"].strip()
    missing = []
    if not name or "placeholder" in name.lower() or name.lower() in {"unknown", "decline", "not provided"}:
        missing.append("customer_name")
    if len(re.sub(r"\D", "", phone)) < 6 or "placeholder" in phone.lower():
        missing.append("phone")
    if missing:
        return {"created": False, "missing": missing, "message": "Ask the customer for their real name and phone number."}
    try:
        date = normalize_date(values["date"])
        time = normalize_time(values["time"])
        tables = available_tables(session, date, time, int(values["guests"]))
    except ValueError:
        return {"available": False, "message": "The reservation date or time is not valid."}
    if not tables:
        return {"available": False}
    reservation = reservation_repository.save_reservation(session, Reservation(user_id=user_id, customer_name=name, phone=phone, date=date, time=time, guests=int(values["guests"])))
    return {
        "available": True,
        "reservation_id": reservation.id,
        "date": reservation.date,
        "time": reservation.time,
        "guests": reservation.guests,
        "customer_name": reservation.customer_name,
    }


def confirm(session: Session, user_id: int, reservation_id: str | None, confirmed: bool) -> dict:
    reservation = reservation_repository.get_reservation(session, reservation_id, user_id) if reservation_id else reservation_repository.latest_draft(session, user_id)
    if not reservation or reservation.status != "draft" or not confirmed:
        return {"confirmed": False}
    tables = available_tables(session, reservation.date, reservation.time, reservation.guests)
    if not tables:
        return {"confirmed": False, "message": "That table time is no longer available."}
    reservation.table_code, reservation.status = tables[0], "confirmed"
    reservation_repository.save_reservation(session, reservation)
    return {"confirmed": True, "reservation_id": reservation.id, "table": reservation.table_code}


def list_confirmed(session: Session, user_id: int) -> list[Reservation]:
    return reservation_repository.list_confirmed(session, user_id)


def details(session: Session, user_id: int, reservation_id: str) -> Reservation | None:
    reservation = reservation_repository.get_reservation(session, reservation_id, user_id)
    return reservation if reservation and reservation.status != "draft" else None


def list_all_confirmed(session: Session) -> list[Reservation]:
    return reservation_repository.list_all_confirmed(session)


def admin_details(session: Session, reservation_id: str) -> Reservation | None:
    reservation = reservation_repository.get_by_id(session, reservation_id)
    return reservation if reservation and reservation.status == "confirmed" else None
