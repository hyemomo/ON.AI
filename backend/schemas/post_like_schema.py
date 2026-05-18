from datetime import datetime
from pydantic import BaseModel

# 좋아요 응답
class PostLikeResponse(BaseModel) :
    likenum: int
    like_postnum: int
    like_usernum: int
    like_created_at: datetime
    
    class Config:
        from_attributes = True

# 좋아요 상태 응답
class PistLikeStatusResponse(BaseModel):
    postnum: int
    like_count: int
    is_liked: bool