from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from utils.security import decode_access_token


security = HTTPBearer()


# 현재 로그인한 사용자 가져오기
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    usernum = decode_access_token(token)

    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="사용자를 찾을 수 없습니다."
        )

    return user