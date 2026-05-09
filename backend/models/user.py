from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


# USERS 테이블 ORM 모델
class User(Base):
    __tablename__ = "USERS"

    usernum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id = Column(String(20), nullable=False, unique=True)
    pwd = Column(String(30), nullable=False)
    nickname = Column(String(30), nullable=False, unique=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")