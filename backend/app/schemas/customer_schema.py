from datetime import datetime

from pydantic import BaseModel


class CustomerOrderResponse(BaseModel):
    id: str
    delivery_address: str
    status: str
    total: float
    created_at: datetime


class AdminOrderResponse(CustomerOrderResponse):
    customer_name: str


class CustomerReservationResponse(BaseModel):
    id: str
    date: str
    time: str
    guests: int
    table_code: str
    status: str
