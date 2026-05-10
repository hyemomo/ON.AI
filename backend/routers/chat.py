from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.rag import generate_reply

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class Source(BaseModel):
    collection: str
    title: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[Source]


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="메시지가 비어있습니다.")
    reply, sources = generate_reply(req.message)
    return ChatResponse(reply=reply, sources=sources)
