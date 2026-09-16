"""Authentication business logic."""

from sqlmodel import Session

from app.core.security import create_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.repositories import user_repository

SEED_USERS = (
    ("Yassine", "custmer@custmer.com", "password", UserRole.CUSTOMER),
    ("Admin", "admin@admin.com", "password", UserRole.ADMIN),
)


def seed_users(session: Session) -> None:
    """Create the two requested local accounts when they do not exist."""

    for name, email, password, role in SEED_USERS:
        if not user_repository.get_by_email(session, email):
            user_repository.save(session, User(name=name, email=email, password_hash=hash_password(password), role=role))


def login(session: Session, email: str, password: str) -> User | None:
    """Check credentials and replace the user's simple opaque token."""

    user = user_repository.get_by_email(session, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    user.token = create_token()
    return user_repository.save(session, user)


def current_user(session: Session, token: str) -> User | None:
    """Find the user who owns an opaque token."""

    return user_repository.get_by_token(session, token)


def logout(session: Session, token: str) -> None:
    """Clear a matching user's active token."""

    user = current_user(session, token)
    if user:
        user.token = None
        user_repository.save(session, user)
