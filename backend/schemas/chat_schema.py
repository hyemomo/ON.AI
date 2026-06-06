from datetime import datetime
from pydantic import BaseModel, Field

from schemas.matching_request_schema import MatchingUserSimpleResponse


class ChatRoomResponse(BaseModel):
    room_id: int
    match_id: int
    other_user: MatchingUserSimpleResponse
    created_at: datetime
    last_message_at: datetime | None = None


class ChatRoomListResponse(BaseModel):
    message: str
    total: int
    rooms: list[ChatRoomResponse]


class ChatMessageCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class ChatMessageResponse(BaseModel):
    message_id: int
    room_id: int
    sender: MatchingUserSimpleResponse
    content: str
    is_read: bool
    created_at: datetime


class ChatMessageListResponse(BaseModel):
    message: str
    total: int
    messages: list[ChatMessageResponse]