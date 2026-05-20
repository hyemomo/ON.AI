from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


# USER_INTEREST_REGIONS 테이블 ORM 모델
class UserInterestRegion(Base):
    __tablename__ = "USER_INTEREST_REGIONS"

    interest_regionnum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    interest_region_user = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)

    region_name = Column(String(100), nullable=False)

    # 같은 유저가 같은 관심지역을 중복 등록하지 못하게 방지함
    __table_args__ = (
        UniqueConstraint(
            "interest_region_user",
            "region_name",
            name="uq_interest_region_user_name"
        ),
    )

    user = relationship("User", back_populates="interest_regions")