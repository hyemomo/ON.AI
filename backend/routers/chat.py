from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.rag import generate_reply

router = APIRouter()


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[HistoryMessage] = []
    mode: str = ""
    policy_category: str = ""


class Source(BaseModel):
    collection: str
    title: str
    url: str = ""


class ChatResponse(BaseModel):
    reply: str
    category: str
    sources: list[Source]
    is_fallback: bool


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="메시지가 비어있습니다.")
    history = [{"role": h.role, "content": h.content} for h in req.history]
    reply, category, sources, is_fallback = generate_reply(req.message, history, req.mode, req.policy_category)
    return ChatResponse(reply=reply, category=category, sources=sources, is_fallback=is_fallback)
