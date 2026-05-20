from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


# PHOTO_IMAGES 테이블 ORM 모델
class PhotoImage(Base):
    __tablename__ = "PHOTO_IMAGES"

    imagenum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_postnum = Column(Integer, ForeignKey("POSTS.postnum", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    image_created_at = Column(DateTime, nullable=False, server_default=func.now())

    post = relationship("Post", back_populates="photo_images")