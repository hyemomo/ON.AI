from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


# USERS 테이블 ORM 모델
# ORM 모델이란? DB 테이블을 파이썬 코드에서 객채처럼 다루기 위해 만든 클래스
class User(Base):
    __tablename__ = "USERS"

    usernum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 로그인 기본 정보
    id = Column(String(20), nullable=False, unique=True)
    pwd = Column(String(255), nullable=False)
    nickname = Column(String(30), nullable=False, unique=True)

    # 부모 사용자 정보
    parents_name = Column(String(20), nullable=False)
    parents_birth = Column(Date, nullable=False)
    parents_gender = Column(String(10), nullable=False)
    parents_mbti = Column(String(4), nullable=True)

    # 추가 계정 정보
    email = Column(String(100), nullable=False, unique=True)
    region = Column(String(50), nullable=False)

    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # relationship 설정
    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    post_likes = relationship("PostLike", back_populates="user")
    
    children = relationship("Child", back_populates="user")
    interest_regions = relationship("UserInterestRegion", back_populates="user")
    interests = relationship("UserInterest", back_populates="user")