from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth_schema import SignupRequest, LoginRequest
from services import auth_service

router = APIRouter()


# 회원가입
@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    return auth_service.signup(db, request)


# 로그인
@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, request)

# 로그아웃 (백엔드는 토큰을 저장하지 않기 때문에 프론트에서 토큰을 삭제해주세요!)
@router.post("/logout")
def logout():
    return {"message": "로그아웃되었습니다. (클라이언트에서 토큰을 삭제해주세요.)"}