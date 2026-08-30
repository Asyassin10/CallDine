"""Menu endpoints."""

from fastapi import APIRouter, Header, HTTPException, status

from app.api.deps import SessionDep
from app.models.user import UserRole
from app.schemas.menu_schema import CategoryResponse, MenuItemCreate, MenuItemResponse
from app.services import auth_service, menu_service

router = APIRouter(prefix="/api/v1", tags=["menu"])


def admin_token(session: SessionDep, authorization: str | None) -> None:
    token = authorization.removeprefix("Bearer ") if authorization else ""
    user = auth_service.current_user(session, token)
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin login required")


@router.get("/menu", response_model=list[MenuItemResponse])
def get_menu(session: SessionDep) -> list[MenuItemResponse]:
    return menu_service.list_menu(session)


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(session: SessionDep) -> list[CategoryResponse]:
    return [CategoryResponse(name=category.name) for category in menu_service.list_categories(session)]


@router.post("/menu", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def add_menu_item(payload: MenuItemCreate, session: SessionDep, authorization: str | None = Header(default=None)) -> MenuItemResponse:
    admin_token(session, authorization)
    item = menu_service.create_menu_item(session, payload)
    if not item:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")
    return item


@router.put("/menu/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, payload: MenuItemCreate, session: SessionDep, authorization: str | None = Header(default=None)) -> MenuItemResponse:
    admin_token(session, authorization)
    item = menu_service.update_menu_item(session, item_id, payload)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item or category not found")
    return item


@router.delete("/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(item_id: int, session: SessionDep, authorization: str | None = Header(default=None)) -> None:
    admin_token(session, authorization)
    if not menu_service.delete_menu_item(session, item_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
