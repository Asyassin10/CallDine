from pydantic import BaseModel


class DashboardDay(BaseModel):
    date: str
    revenue: float
    orders: int
    reservations: int


class DashboardStats(BaseModel):
    revenue: float
    orders: int
    reservations: int
    ai_success_rate: float
    successful_ai_calls: int
    ai_calls: int


class DashboardMonth(BaseModel):
    month: str
    orders: int
    reservations: int


class OrderStatuses(BaseModel):
    confirmed: int
    preparing: int
    ready: int
    completed: int


class DashboardResponse(BaseModel):
    stats: DashboardStats
    days: list[DashboardDay]
    months: list[DashboardMonth]
    statuses: OrderStatuses
