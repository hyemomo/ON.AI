from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services import mypage_service
from dependencies import get_current_user
from models.user import User

from schemas.mypage_schema import (
    MyPageUpdateRequest,
    ChildrenUpdateRequest,
    InterestRegionsUpdateRequest,
    InterestsUpdateRequest
)

router = APIRouter()


# 내 마이페이지 조회
@router.get("/me")
def get_my_mypage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mypage_service.get_mypage(db, current_user.usernum)


# 내 부모 기본정보 수정
@router.put("/me")
def update_my_mypage(
    request: MyPageUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mypage_service.update_mypage(db, current_user.usernum, request)


# 내 자녀 정보 수정
@router.put("/me/children")
def update_my_children(
    request: ChildrenUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mypage_service.update_children(db, current_user.usernum, request)


# 내 관심지역 수정
@router.put("/me/interest-regions")
def update_my_interest_regions(
    request: InterestRegionsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mypage_service.update_interest_regions(db, current_user.usernum, request)


# 내 관심사 수정
@router.put("/me/interests")
def update_my_interests(
    request: InterestsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mypage_service.update_interests(db, current_user.usernum, request)


# 특정 유저 마이페이지 조회
# 테스트용 또는 관리자/공개 프로필용으로만 사용을 권장합니다..!
@router.get("/{usernum}")
def get_mypage(usernum: int, db: Session = Depends(get_db)):
    return mypage_service.get_mypage(db, usernum)