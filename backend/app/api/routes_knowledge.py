"""Knowledge base endpoints."""

from fastapi import APIRouter, BackgroundTasks, File, Form, Header, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from app.api.deps import SessionDep
from app.api.routes_menu import admin_token
from app.schemas.knowledge_schema import KnowledgeEntryResponse
from app.services import knowledge_service

router = APIRouter(prefix="/api/v1/knowledge", tags=["knowledge"])


def response(entry, job) -> KnowledgeEntryResponse:
    return KnowledgeEntryResponse(id=entry.id, title=entry.title, s3_key=entry.s3_key, created_at=entry.created_at, status=job.status if job else "stored", progress=job.progress if job else 100, message=job.message if job else "Stored in S3")


@router.get("", response_model=list[KnowledgeEntryResponse])
def list_knowledge(session: SessionDep, authorization: str | None = Header(default=None)) -> list[KnowledgeEntryResponse]:
    admin_token(session, authorization)
    return [response(entry, job) for entry, job in knowledge_service.list_entries(session)]


@router.post("", response_model=KnowledgeEntryResponse, status_code=status.HTTP_201_CREATED)
def upload_knowledge(session: SessionDep, background_tasks: BackgroundTasks, file: UploadFile = File(...), title: str = Form(...), authorization: str | None = Header(default=None)) -> KnowledgeEntryResponse:
    admin_token(session, authorization)
    if not file.filename or not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload a PDF file")
    entry = knowledge_service.upload_pdf(session, file, title)
    job = knowledge_service.queue_entry(session, entry.id)
    background_tasks.add_task(knowledge_service.process_entry, entry.id)
    return response(entry, job)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge(entry_id: int, session: SessionDep, authorization: str | None = Header(default=None)) -> None:
    admin_token(session, authorization)
    if not knowledge_service.delete_entry(session, entry_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge entry not found")


@router.get("/{entry_id}/preview")
def preview_knowledge(entry_id: int, session: SessionDep, authorization: str | None = Header(default=None)) -> StreamingResponse:
    admin_token(session, authorization)
    content = knowledge_service.read_pdf(session, entry_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge entry not found")
    return StreamingResponse(iter([content]), media_type="application/pdf")
