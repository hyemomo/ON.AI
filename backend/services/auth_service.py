from sqlalchemy.orm import Session
from fastapi import HTTPException
from constants import ALLOWED_REGIONS

from models.user import User
from schemas.auth_schema import SignupRequest, LoginRequest
from utils.security import hash_password, verify_password, create_access_token


def signup(db: Session, request: SignupRequest):
    # 아이디 중복 확인
    existing_user = db.query(User).filter(User.id == request.id).first()

    if existing_user is not None:
        raise HTTPException(
            status_code=400,
            detail="이미 사용 중인 아이디입니다."
        )

    # 닉네임 중복 확인
    existing_nickname = db.query(User).filter(User.nickname == request.nickname).first()

    if existing_nickname is not None:
        raise HTTPException(
            status_code=400,
            detail="이미 사용 중인 닉네임입니다."
        )

    # 이메일 중복 확인
    existing_email = db.query(User).filter(User.email == request.email).first()

    if existing_email is not None:
        raise HTTPException(
            status_code=400,
            detail="이미 사용 중인 이메일입니다."
        )

    # 지역 검증
    if request.region not in ALLOWED_REGIONS:
        raise HTTPException(
            status_code=400,
            detail="허용되지 않은 지역입니다."
        )

    hashed_pwd = hash_password(request.pwd)

    new_user = User(
        id=request.id,
        pwd=hashed_pwd,
        nickname=request.nickname,
        parents_name=request.parents_name,
        parents_birth=request.parents_birth,
        parents_gender=request.parents_gender,
        parents_mbti=request.parents_mbti,
        email=request.email,
        region=request.region
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "회원가입이 완료되었습니다.",
        "user": {
            "usernum": new_user.usernum,
            "id": new_user.id,
            "nickname": new_user.nickname,
            "parents_name": new_user.parents_name,
            "parents_birth": new_user.parents_birth,
            "parents_gender": new_user.parents_gender,
            "parents_mbti": new_user.parents_mbti,
            "email": new_user.email,
            "region": new_user.region,
            "created_at": new_user.created_at
        }
    }


# 로그인
def login(db: Session, request: LoginRequest):
    user = db.query(User).filter(User.id == request.id).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 일치하지 않습니다."
        )

    if not verify_password(request.pwd, user.pwd):
        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 일치하지 않습니다."
        )

    access_token = create_access_token(
        data={"usernum": user.usernum}
    )

    return {
        "message": "로그인 성공",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "usernum": user.usernum,
            "id": user.id,
            "nickname": user.nickname,
            "parents_name": user.parents_name,
            "parents_birth": user.parents_birth,
            "parents_gender": user.parents_gender,
            "parents_mbti": user.parents_mbti,
            "email": user.email,
            "region": user.region,
            "created_at": user.created_at
        }
    }