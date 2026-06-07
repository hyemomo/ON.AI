from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.user import User
from schemas.chat_schema import (
    ChatMessageCreateRequest,
    ChatMessageListResponse,
    ChatMessageResponse,
    ChatRoomListResponse,
)
from services import chat_service


router = APIRouter()


@router.get(
    "/rooms",
    response_model=ChatRoomListResponse,
    summary="채팅방 목록 조회",
)
def get_chat_rooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return chat_service.get_chat_rooms(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/rooms/{room_id}/messages",
    response_model=ChatMessageListResponse,
    summary="채팅 메시지 목록 조회",
)
def get_chat_messages(
    room_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return chat_service.get_chat_messages(
        db=db,
        current_user=current_user,
        room_id=room_id,
    )


@router.post(
    "/rooms/{room_id}/messages",
    response_model=ChatMessageResponse,
    summary="채팅 메시지 보내기",
)
def create_chat_message(
    request: ChatMessageCreateRequest,
    room_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return chat_service.create_chat_message(
        db=db,
        current_user=current_user,
        room_id=room_id,
        request=request,
    )