from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class ChatRoom(Base):
    __tablename__ = "CHAT_ROOMS"

    room_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    match_id = Column(Integer, ForeignKey("MATCHES.match_id"), nullable=False, unique=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    last_message_at = Column(DateTime, nullable=True)

    match = relationship("Match", back_populates="chat_room")
    messages = relationship("ChatMessage", back_populates="chat_room")