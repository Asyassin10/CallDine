from sqlmodel import Field, SQLModel


class DashboardMetric(SQLModel, table=True):
    date: str = Field(primary_key=True)
    revenue: float
    orders: int
    reservations: int
    ai_calls: int
    successful_ai_calls: int
    confirmed: int
    preparing: int
    ready: int
    completed: int
