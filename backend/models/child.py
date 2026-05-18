from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


# CHILDREN 테이블 ORM 모델
class Child(Base):
    __tablename__ = "CHILDREN"

    childnum = Column(Integer, primary_key=True, index=True, autoincrement=True)
    parentsnum = Column(Integer, ForeignKey("USERS.usernum"), nullable=False)

    child_name = Column(String(15), nullable=False)
    child_birth = Column(Date, nullable=False)
    child_gender = Column(String(10), nullable=False)

    # 같은 부모가 같은 이름/생년월일의 아이를 중복 등록하지 못하게 방지하는 부분입니다.
    __table_args__ = (
        UniqueConstraint(
            "parentsnum",
            "child_name",
            "child_birth",
            name="uq_children_parent_name_birth"
        ),
    )

    user = relationship("User", back_populates="children")