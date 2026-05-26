from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


# POST_LIKES 테이블 ORM 모델
class PostLike(Base):
    __tablename__ = "POST_LIKES"

    likenum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    like_postnum = Column(Integer, ForeignKey("POSTS.postnum"), nullable=False)
    like_usernum = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)

    like_created_at = Column(DateTime, nullable=False, server_default=func.now())

    # 같은 사용자가 같은 게시글에 좋아요를 중복해서 누르지 못하게 함
    __table_args__ = (
        UniqueConstraint("like_postnum", "like_usernum", name="uq_post_like_user"),
    )

    user = relationship("User", back_populates="post_likes")
    post = relationship("Post", back_populates="post_likes")