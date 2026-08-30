"""User database queries only."""

from sqlmodel import Session, select

from app.models.user import User


def get_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def get_by_token(session: Session, token: str) -> User | None:
    return session.exec(select(User).where(User.token == token)).first()


def save(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
