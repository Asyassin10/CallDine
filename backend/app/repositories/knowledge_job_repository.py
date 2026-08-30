"""Knowledge processing job queries."""

from sqlmodel import Session, select

from app.models.knowledge_job import KnowledgeJob


def get_by_entry_id(session: Session, entry_id: int) -> KnowledgeJob | None:
    return session.exec(select(KnowledgeJob).where(KnowledgeJob.entry_id == entry_id)).first()


def save(session: Session, job: KnowledgeJob) -> KnowledgeJob:
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


def delete(session: Session, job: KnowledgeJob) -> None:
    session.delete(job)
    session.commit()
