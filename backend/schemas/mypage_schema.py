from datetime import date, datetime
from pydantic import BaseModel, EmailStr


# 자녀 정보 응답
class ChildResponse(BaseModel):
    childnum: int
    child_name: str
    child_birth: date
    child_gender: str

    class Config:
        from_attributes = True


# 관심지역 응답
class InterestRegionResponse(BaseModel):
    interest_regionnum: int
    region_name: str

    class Config:
        from_attributes = True


# 관심사 응답
class InterestResponse(BaseModel):
    interestnum: int
    interest_name: str

    class Config:
        from_attributes = True


# 마이페이지 전체 조회 응답
class MyPageResponse(BaseModel):
    usernum: int
    id: str
    nickname: str

    parents_name: str
    parents_birth: date
    parents_gender: str
    parents_mbti: str | None = None

    email: str
    region: str
    created_at: datetime

    children: list[ChildResponse] = []
    interest_regions: list[InterestRegionResponse] = []
    interests: list[InterestResponse] = []

    class Config:
        from_attributes = True


# 부모 기본정보 수정 요청
class MyPageUpdateRequest(BaseModel):
    nickname: str
    parents_name: str
    parents_birth: date
    parents_gender: str
    parents_mbti: str | None = None
    email: EmailStr
    region: str


# 자녀 정보 등록/수정 요청
class ChildRequest(BaseModel):
    child_name: str
    child_birth: date
    child_gender: str


# 자녀 목록 수정 요청
class ChildrenUpdateRequest(BaseModel):
    children: list[ChildRequest]


# 관심지역 목록 수정 요청
class InterestRegionsUpdateRequest(BaseModel):
    interest_regions: list[str]


# 관심사 목록 수정 요청
class InterestsUpdateRequest(BaseModel):
    interests: list[str]