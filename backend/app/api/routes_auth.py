"""Authentication endpoints."""

from fastapi import APIRouter, Header, HTTPException, status

from app.api.deps import SessionDep
from app.schemas.auth_schema import LoginRequest, LoginResponse, UserResponse
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def bearer_token(authorization: str | None) -> str:
    """Extract the token from an Authorization header."""

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return authorization.removeprefix("Bearer ")


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, session: SessionDep) -> LoginResponse:
    user = auth_service.login(session, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return LoginResponse(token=user.token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(session: SessionDep, authorization: str | None = Header(default=None)) -> UserResponse:
    user = auth_service.current_user(session, bearer_token(authorization))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return UserResponse.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(session: SessionDep, authorization: str | None = Header(default=None)) -> None:
    auth_service.logout(session, bearer_token(authorization))
