from datetime import date, datetime
from pydantic import BaseModel, EmailStr


# 회원가입 요청 형식
class SignupRequest(BaseModel):
    id: str
    pwd: str
    nickname: str

    parents_name: str
    parents_birth: date
    parents_gender: str
    parents_mbti: str | None = None

    email: EmailStr
    region: str


# 로그인 요청 형식
class LoginRequest(BaseModel):
    id: str
    pwd: str


# 로그인/회원가입 성공 시 반환할 유저 정보
class UserResponse(BaseModel):
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

    class Config:
        from_attributes = True


# 로그인 응답 형식
class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    user: UserResponse


# 회원가입 응답 형식
class SignupResponse(BaseModel):
    message: str
    user: UserResponse