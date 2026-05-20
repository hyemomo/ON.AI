from datetime import datetime
from pydantic import BaseModel


# 게시글 생성 요청 데이터 타입
class PostCreate(BaseModel):
    p_title: str
    p_content: str
    p_region_tag: str
    p_category_tag: str


# 게시글 수정 요청 데이터 타입
class PostUpdateRequest(BaseModel):
    p_title: str
    p_content: str
    p_region_tag: str
    p_category_tag: str


# 게시글 응답 데이터 타입
# 현재 라우터에서 response_model로 강제하지 않으므로 참고용 스키마
class PostResponse(BaseModel):
    postnum: int
    p_title: str
    p_content: str
    p_user: int
    nickname: str
    p_region_tag: str
    p_category_tag: str
    p_created_at: datetime
    comment_count: int
    like_count: int
    is_liked: bool

    class Config:
        from_attributes = True