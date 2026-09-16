from datetime import datetime

from pydantic import BaseModel


class ConversationResponse(BaseModel):
    id: str
    title: str
    updated_at: datetime


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime


class ChatRequest(BaseModel):
    message: str
