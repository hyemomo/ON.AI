from pydantic import BaseModel
from datetime import datetime


# 댓글 생성 요청 데이터 타입
class CommentCreate(BaseModel):
    c_content: str
    c_post: int


# 댓글 수정 요청 데이터 타입
class CommentUpdateRequest(BaseModel):
    c_content: str


# 댓글 응답 데이터 타입
class CommentResponse(BaseModel):
    commentnum: int
    c_content: str
    c_user: int
    c_post: int
    nickname: str
    c_created_at: datetime

    class Config:
        from_attributes = True