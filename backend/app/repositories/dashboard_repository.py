from sqlmodel import Session, select

from app.models.dashboard_metric import DashboardMetric


def get(session: Session, metric_date: str) -> DashboardMetric | None:
    return session.get(DashboardMetric, metric_date)


def save(session: Session, metric: DashboardMetric) -> DashboardMetric:
    session.add(metric)
    session.commit()
    session.refresh(metric)
    return metric


def save_all(session: Session, metrics: list[DashboardMetric]) -> None:
    session.add_all(metrics)
    session.commit()


def recent(session: Session, limit: int = 7) -> list[DashboardMetric]:
    metrics = session.exec(select(DashboardMetric).order_by(DashboardMetric.date.desc()).limit(limit)).all()
    return list(reversed(metrics))


def since(session: Session, start_date: str) -> list[DashboardMetric]:
    return list(session.exec(select(DashboardMetric).where(DashboardMetric.date >= start_date).order_by(DashboardMetric.date)))
