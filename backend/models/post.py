from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


# POSTS 테이블 ORM 모델
class Post(Base):
    __tablename__ = "POSTS"

    postnum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    p_title = Column(String(50), nullable=False)
    p_content = Column(Text, nullable=False)
    p_user = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)
    p_created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="posts")
    comments = relationship(
        "Comment", 
        back_populates="post",
        passive_deletes=True
    )