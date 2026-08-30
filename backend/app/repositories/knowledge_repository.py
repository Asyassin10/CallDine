"""Knowledge entry database queries."""

from sqlmodel import Session, select

from app.models.knowledge import KnowledgeEntry


def list_all(session: Session) -> list[KnowledgeEntry]:
    return list(session.exec(select(KnowledgeEntry).order_by(KnowledgeEntry.created_at.desc())))


def get_by_id(session: Session, entry_id: int) -> KnowledgeEntry | None:
    return session.get(KnowledgeEntry, entry_id)


def save(session: Session, entry: KnowledgeEntry) -> KnowledgeEntry:
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


def delete(session: Session, entry: KnowledgeEntry) -> None:
    session.delete(entry)
    session.commit()
