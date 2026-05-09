from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


# COMMENTS 테이블 ORM 모델
class Comment(Base):
    __tablename__ = "COMMENTS"

    commentnum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    c_content = Column(String(255), nullable=False)
    c_user = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)
    c_post = Column(Integer, ForeignKey("POSTS.postnum"), nullable=False)
    c_created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")