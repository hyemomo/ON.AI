from pydantic import BaseModel
from datetime import datetime


# 게시글 생성 요청 데이터 타입
class PostCreate(BaseModel):
    p_title: str
    p_content: str
    p_user: int


# 게시글 응답 데이터 타입
class PostResponse(BaseModel):
    postnum: int
    p_title: str
    p_content: str
    p_user: int
    nickname: str
    p_created_at: datetime

    class Config:
        from_attributes = True