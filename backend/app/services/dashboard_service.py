from datetime import date, timedelta

from sqlmodel import Session

from app.models.dashboard_metric import DashboardMetric
from app.repositories import dashboard_repository

WEEKDAY_LOAD = [0, 3, 1, 5, 9, 15, 11]
SEASONAL_LOAD = [-3, -2, 0, 2, 4, 7, 10, 9, 5, 2, 1, 5]


def month_start(day: date, months_back: int) -> date:
    index = day.year * 12 + day.month - 1 - months_back
    return date(index // 12, index % 12 + 1, 1)


def values_for(day: date) -> dict:
    variation = day.toordinal() * 17 % 11 - 5
    orders = max(12, 23 + WEEKDAY_LOAD[day.weekday()] + SEASONAL_LOAD[day.month - 1] + variation)
    reservations = max(8, 16 + round(WEEKDAY_LOAD[day.weekday()] * .7) + round(SEASONAL_LOAD[day.month - 1] * .5) + variation // 2)
    ai_calls = max(1, round(orders * (.62 + day.day % 5 * .035)))
    successful = round(ai_calls * (.84 + day.day % 4 * .025))
    confirmed, preparing, ready = round(orders * .18), round(orders * .16), round(orders * .12)
    return {"revenue": round(orders * (54 + day.toordinal() * 13 % 19), 2), "orders": orders, "reservations": reservations, "ai_calls": ai_calls, "successful_ai_calls": min(successful, ai_calls), "confirmed": confirmed, "preparing": preparing, "ready": ready, "completed": orders - confirmed - preparing - ready}


def seed_metrics(session: Session) -> None:
    metrics = []
    for offset in range(400):
        day = date.today() - timedelta(days=399 - offset)
        values = values_for(day)
        metric = dashboard_repository.get(session, day.isoformat()) or DashboardMetric(date=day.isoformat(), **values)
        for name, value in values.items():
            setattr(metric, name, value)
        metrics.append(metric)
    dashboard_repository.save_all(session, metrics)


def dashboard(session: Session) -> dict:
    days = dashboard_repository.recent(session)
    today = days[-1]
    statuses = {name: sum(getattr(day, name) for day in days) for name in ("confirmed", "preparing", "ready", "completed")}
    rate = round(today.successful_ai_calls / today.ai_calls * 100, 1) if today.ai_calls else 0
    starts = [month_start(date.today(), offset) for offset in reversed(range(12))]
    buckets = {start.strftime("%Y-%m"): {"month": start.strftime("%Y-%m"), "orders": 0, "reservations": 0} for start in starts}
    for metric in dashboard_repository.since(session, starts[0].isoformat()):
        if metric.date[:7] in buckets:
            buckets[metric.date[:7]]["orders"] += metric.orders
            buckets[metric.date[:7]]["reservations"] += metric.reservations
    return {"stats": {"revenue": today.revenue, "orders": today.orders, "reservations": today.reservations, "ai_success_rate": rate, "successful_ai_calls": today.successful_ai_calls, "ai_calls": today.ai_calls}, "days": days, "months": list(buckets.values()), "statuses": statuses}
