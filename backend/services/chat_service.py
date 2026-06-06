from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import case, or_
from sqlalchemy.orm import Session, joinedload

from models.chat_message import ChatMessage
from models.chat_room import ChatRoom
from models.match import Match
from models.user import User
from schemas.chat_schema import (
    ChatMessageCreateRequest,
    ChatMessageListResponse,
    ChatMessageResponse,
    ChatRoomListResponse,
    ChatRoomResponse,
)
from services.matching_request_service import build_user_simple_response


def get_room_if_member(
    db: Session,
    current_user: User,
    room_id: int,
) -> ChatRoom:
    room = (
        db.query(ChatRoom)
        .options(
            joinedload(ChatRoom.match).joinedload(Match.user1),
            joinedload(ChatRoom.match).joinedload(Match.user2),
        )
        .filter(ChatRoom.room_id == room_id)
        .first()
    )

    if room is None:
        raise HTTPException(status_code=404, detail="채팅방을 찾을 수 없습니다.")

    if (
        room.match.user1_usernum != current_user.usernum
        and room.match.user2_usernum != current_user.usernum
    ):
        raise HTTPException(status_code=403, detail="이 채팅방에 접근할 권한이 없습니다.")

    return room


def get_other_user_from_match(match: Match, current_user: User) -> User:
    if match.user1_usernum == current_user.usernum:
        return match.user2

    return match.user1


def get_chat_rooms(
    db: Session,
    current_user: User,
) -> ChatRoomListResponse:
    rooms = (
        db.query(ChatRoom)
        .join(Match, ChatRoom.match_id == Match.match_id)
        .options(
            joinedload(ChatRoom.match).joinedload(Match.user1),
            joinedload(ChatRoom.match).joinedload(Match.user2),
        )
        .filter(
            or_(
                Match.user1_usernum == current_user.usernum,
                Match.user2_usernum == current_user.usernum,
            )
        )
        .order_by(
            case(
                (ChatRoom.last_message_at.is_(None), 1),
                else_=0,
            ).asc(),
            ChatRoom.last_message_at.desc(),
            ChatRoom.created_at.desc(),
        )
        .all()
    )

    response_items: list[ChatRoomResponse] = []

    for room in rooms:
        other_user = get_other_user_from_match(room.match, current_user)

        response_items.append(
            ChatRoomResponse(
                room_id=room.room_id,
                match_id=room.match_id,
                other_user=build_user_simple_response(other_user),
                created_at=room.created_at,
                last_message_at=room.last_message_at,
            )
        )

    return ChatRoomListResponse(
        message="채팅방 목록입니다.",
        total=len(response_items),
        rooms=response_items,
    )


def build_message_response(message: ChatMessage) -> ChatMessageResponse:
    return ChatMessageResponse(
        message_id=message.message_id,
        room_id=message.room_id,
        sender=build_user_simple_response(message.sender),
        content=message.content,
        is_read=message.is_read,
        created_at=message.created_at,
    )


def get_chat_messages(
    db: Session,
    current_user: User,
    room_id: int,
) -> ChatMessageListResponse:
    room = get_room_if_member(
        db=db,
        current_user=current_user,
        room_id=room_id,
    )

    messages = (
        db.query(ChatMessage)
        .options(joinedload(ChatMessage.sender))
        .filter(ChatMessage.room_id == room.room_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    for message in messages:
        if message.sender_usernum != current_user.usernum and not message.is_read:
            message.is_read = True

    db.commit()

    return ChatMessageListResponse(
        message="채팅 메시지 목록입니다.",
        total=len(messages),
        messages=[build_message_response(item) for item in messages],
    )


def create_chat_message(
    db: Session,
    current_user: User,
    room_id: int,
    request: ChatMessageCreateRequest,
) -> ChatMessageResponse:
    room = get_room_if_member(
        db=db,
        current_user=current_user,
        room_id=room_id,
    )

    new_message = ChatMessage(
        room_id=room.room_id,
        sender_usernum=current_user.usernum,
        content=request.content,
        is_read=False,
    )

    room.last_message_at = datetime.now()

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    created_message = (
        db.query(ChatMessage)
        .options(joinedload(ChatMessage.sender))
        .filter(ChatMessage.message_id == new_message.message_id)
        .first()
    )

    return build_message_response(created_message)