from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class ChatMessage(Base):
    __tablename__ = "CHAT_MESSAGES"

    message_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("CHAT_ROOMS.room_id"), nullable=False)
    sender_usernum = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)
    content = Column(String(1000), nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    chat_room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User", back_populates="chat_messages")