from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class MatchingRequest(Base):
    __tablename__ = "MATCHING_REQUESTS"

    request_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    requester_usernum = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)
    receiver_usernum = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)

    # PENDING: 요청 대기, ACCEPTED: 수락, REJECTED: 거절, CANCELED: 요청 취소
    status = Column(String(20), nullable=False, default="PENDING")
    message = Column(String(255), nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    responded_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "requester_usernum",
            "receiver_usernum",
            name="uq_matching_request_pair"
        ),
    )

    requester = relationship(
        "User",
        foreign_keys=[requester_usernum],
        back_populates="sent_matching_requests"
    )
    receiver = relationship(
        "User",
        foreign_keys=[receiver_usernum],
        back_populates="received_matching_requests"
    )
    match = relationship("Match", back_populates="matching_request", uselist=False)