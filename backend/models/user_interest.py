from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


# USER_INTERESTS 테이블 ORM 모델
class UserInterest(Base):
    __tablename__ = "USER_INTERESTS"

    interestnum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    interest_user = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)

    interest_name = Column(String(100), nullable=False)

    # 같은 유저가 같은 관심사를 중복 등록하지 못하게 방지함
    __table_args__ = (
        UniqueConstraint(
            "interest_user",
            "interest_name",
            name="uq_interest_user_name"
        ),
    )

    user = relationship("User", back_populates="interests")