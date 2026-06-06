from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Match(Base):
    __tablename__ = "MATCHES"

    match_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user1_usernum = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)
    user2_usernum = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)
    matching_request_id = Column(Integer, ForeignKey("MATCHING_REQUESTS.request_id"), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "user1_usernum",
            "user2_usernum",
            name="uq_match_user_pair"
        ),
    )

    user1 = relationship(
        "User",
        foreign_keys=[user1_usernum],
        back_populates="matches_as_user1"
    )
    user2 = relationship(
        "User",
        foreign_keys=[user2_usernum],
        back_populates="matches_as_user2"
    )
    matching_request = relationship("MatchingRequest", back_populates="match")
    chat_room = relationship("ChatRoom", back_populates="match", uselist=False)