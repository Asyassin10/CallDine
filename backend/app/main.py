"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.api.routes_auth import router as auth_router
from app.api.routes_admin import router as admin_router
from app.api.routes_conversation import router as conversation_router
from app.api.routes_customer import router as customer_router
from app.api.routes_knowledge import router as knowledge_router
from app.api.routes_menu import router as menu_router
from app.api.routes_voice import router as voice_router
from app.config import get_settings
from app.core.database import create_tables, engine
from app.services.auth_service import seed_users
from app.services.dashboard_service import seed_metrics
from app.services.menu_service import seed_menu
from app.repositories.reservation_repository import seed_tables

settings = get_settings()

@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    with Session(engine) as session:
        seed_users(session)
        seed_menu(session)
        seed_tables(session)
        seed_metrics(session)
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(conversation_router)
app.include_router(customer_router)
app.include_router(menu_router)
app.include_router(voice_router)
app.include_router(knowledge_router)

@app.get("/", tags=["system"])
def read_root() -> dict[str, str]:
    """Confirm that the backend is running."""

    return {"message": "CallDine AI backend running"}


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Provide a lightweight service health check."""

    return {"status": "ok"}
