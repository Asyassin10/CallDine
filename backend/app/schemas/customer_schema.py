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


class CustomerOrderItem(BaseModel):
    name: str
    quantity: int
    unit_price: float


class CustomerOrderDetail(CustomerOrderResponse):
    items: list[CustomerOrderItem]


class AdminOrderDetail(CustomerOrderDetail):
    customer_name: str


class CustomerReservationResponse(BaseModel):
    id: str
    date: str
    time: str
    guests: int
    table_code: str
    status: str


class CustomerReservationDetail(CustomerReservationResponse):
    customer_name: str
    phone: str
