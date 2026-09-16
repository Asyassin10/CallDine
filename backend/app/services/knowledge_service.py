"""Knowledge file storage and processing."""

import time
from uuid import uuid4

from fastapi import UploadFile
from qdrant_client.models import Distance, PointStruct, VectorParams
from sqlmodel import Session

from app.aws.s3_client import get_s3_client
from app.aws.textract_client import get_textract_client
from app.config import get_settings
from app.core.database import engine
from app.core.qdrant import get_qdrant_client
from app.models.knowledge import KnowledgeEntry
from app.models.knowledge_job import KnowledgeJob
from app.repositories import knowledge_job_repository, knowledge_repository
from app.services.embedding_service import create_embedding


def upload_pdf(session: Session, file: UploadFile, title: str) -> KnowledgeEntry:
    key = f"knowledge/{uuid4()}-{file.filename}"
    entry = knowledge_repository.save(session, KnowledgeEntry(title=title, s3_key=key))
    settings = get_settings()
    get_s3_client().upload_fileobj(file.file, settings.s3_access_point or settings.s3_bucket, key, ExtraArgs={"ContentType": "application/pdf"})
    return entry


def queue_entry(session: Session, entry_id: int) -> KnowledgeJob:
    return knowledge_job_repository.save(session, KnowledgeJob(entry_id=entry_id))


def list_entries(session: Session) -> list[tuple[KnowledgeEntry, KnowledgeJob | None]]:
    return [(entry, knowledge_job_repository.get_by_entry_id(session, entry.id)) for entry in knowledge_repository.list_all(session)]


def delete_entry(session: Session, entry_id: int) -> bool:
    entry = knowledge_repository.get_by_id(session, entry_id)
    if not entry:
        return False
    job = knowledge_job_repository.get_by_entry_id(session, entry_id)
    settings = get_settings()
    get_s3_client().delete_object(Bucket=settings.s3_access_point or settings.s3_bucket, Key=entry.s3_key)
    if job:
        knowledge_job_repository.delete(session, job)
    knowledge_repository.delete(session, entry)
    return True


def read_pdf(session: Session, entry_id: int) -> bytes | None:
    entry = knowledge_repository.get_by_id(session, entry_id)
    if not entry:
        return None
    settings = get_settings()
    return get_s3_client().get_object(Bucket=settings.s3_access_point or settings.s3_bucket, Key=entry.s3_key)["Body"].read()


def update_job(session: Session, job: KnowledgeJob, status: str, progress: int, message: str) -> None:
    job.status, job.progress, job.message = status, progress, message
    knowledge_job_repository.save(session, job)


def chunks(text: str) -> list[str]:
    return [text[index:index + 1000] for index in range(0, len(text), 1000)]


def search(query: str) -> list[str]:
    settings = get_settings()
    client = get_qdrant_client()
    if not client.collection_exists(settings.qdrant_collection):
        return []
    results = client.query_points(settings.qdrant_collection, query=create_embedding(query), limit=4).points
    return [str(result.payload.get("text", "")) for result in results]


def process_entry(entry_id: int) -> None:
    with Session(engine) as session:
        entry = knowledge_repository.get_by_id(session, entry_id)
        job = knowledge_job_repository.get_by_entry_id(session, entry_id)
        if not entry or not job:
            return
        try:
            update_job(session, job, "processing", 10, "Extracting text with Textract")
            textract_job = get_textract_client().start_document_text_detection(DocumentLocation={"S3Object": {"Bucket": get_settings().s3_bucket, "Name": entry.s3_key}})["JobId"]
            while True:
                result = get_textract_client().get_document_text_detection(JobId=textract_job)
                if result["JobStatus"] != "IN_PROGRESS":
                    break
                time.sleep(2)
            if result["JobStatus"] != "SUCCEEDED":
                raise RuntimeError("Textract could not read this PDF")
            blocks = result["Blocks"]
            while result.get("NextToken"):
                result = get_textract_client().get_document_text_detection(JobId=textract_job, NextToken=result["NextToken"])
                blocks.extend(result["Blocks"])
            text = "\n".join(block["Text"] for block in blocks if block["BlockType"] == "LINE")
            update_job(session, job, "processing", 55, "Creating Titan embeddings")
            client, settings = get_qdrant_client(), get_settings()
            if not client.collection_exists(settings.qdrant_collection):
                client.create_collection(settings.qdrant_collection, vectors_config=VectorParams(size=1024, distance=Distance.COSINE))
            parts = chunks(text)
            for index, chunk in enumerate(parts):
                client.upsert(settings.qdrant_collection, points=[PointStruct(id=str(uuid4()), vector=create_embedding(chunk), payload={"entry_id": entry.id, "title": entry.title, "s3_key": entry.s3_key, "chunk": index, "text": chunk})])
                update_job(session, job, "processing", 55 + int((index + 1) / len(parts) * 40), "Saving knowledge to Qdrant")
            update_job(session, job, "ready", 100, "Your AI assistant can now use this knowledge")
        except Exception:
            update_job(session, job, "failed", 100, "Processing failed")
