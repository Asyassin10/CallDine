from fastapi import APIRouter, Header, HTTPException, status

from app.api.deps import SessionDep
from app.api.routes_auth import bearer_token
from app.models.user import UserRole
from app.schemas.customer_schema import CustomerOrderResponse, CustomerReservationResponse, CustomerOrderDetail, CustomerReservationDetail
from app.services import auth_service, order_service, reservation_service

router = APIRouter(prefix="/api/v1/customer", tags=["customer"])


def customer(session: SessionDep, authorization: str | None):
    user = auth_service.current_user(session, bearer_token(authorization))
    if not user or user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer login required")
    return user


@router.get("/orders", response_model=list[CustomerOrderResponse])
def orders(session: SessionDep, authorization: str | None = Header(default=None)):
    return order_service.list_confirmed(session, customer(session, authorization).id)


@router.get("/reservations", response_model=list[CustomerReservationResponse])
def reservations(session: SessionDep, authorization: str | None = Header(default=None)):
    return reservation_service.list_confirmed(session, customer(session, authorization).id)


@router.get("/orders/{order_id}", response_model=CustomerOrderDetail)
def order_detail(order_id: str, session: SessionDep, authorization: str | None = Header(default=None)):
    order = order_service.details(session, customer(session, authorization).id, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/reservations/{reservation_id}", response_model=CustomerReservationDetail)
def reservation_detail(reservation_id: str, session: SessionDep, authorization: str | None = Header(default=None)):
    reservation = reservation_service.details(session, customer(session, authorization).id, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation
