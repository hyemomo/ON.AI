from datetime import datetime
from pydantic import BaseModel, Field


class MatchingRequestCreateRequest(BaseModel):
    receiver_usernum: int
    message: str | None = Field(default=None, max_length=255)


class MatchingUserSimpleResponse(BaseModel):
    usernum: int
    nickname: str
    parents_mbti: str | None = None
    region: str

    class Config:
        from_attributes = True


class MatchingRequestResponse(BaseModel):
    request_id: int
    requester: MatchingUserSimpleResponse
    receiver: MatchingUserSimpleResponse
    status: str
    message: str | None = None
    created_at: datetime
    responded_at: datetime | None = None

    class Config:
        from_attributes = True


class MatchingRequestListResponse(BaseModel):
    message: str
    total: int
    requests: list[MatchingRequestResponse]


class MatchResponse(BaseModel):
    match_id: int
    matched_user: MatchingUserSimpleResponse
    chat_room_id: int | None = None
    created_at: datetime


class MatchListResponse(BaseModel):
    message: str
    total: int
    matches: list[MatchResponse]