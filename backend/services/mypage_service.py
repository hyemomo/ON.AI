from sqlalchemy.orm import Session
from fastapi import HTTPException
from constants import ALLOWED_REGIONS

from models.user import User
from models.child import Child
from models.user_interest_region import UserInterestRegion
from models.user_interest import UserInterest

from schemas.mypage_schema import (
    MyPageUpdateRequest,
    ChildrenUpdateRequest,
    InterestRegionsUpdateRequest,
    InterestsUpdateRequest
)


# 마이페이지 조회
def get_mypage(db: Session, usernum: int):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    children = db.query(Child).filter(Child.parentsnum == usernum).all()

    interest_regions = (
        db.query(UserInterestRegion)
        .filter(UserInterestRegion.interest_region_user == usernum)
        .all()
    )

    interests = (
        db.query(UserInterest)
        .filter(UserInterest.interest_user == usernum)
        .all()
    )

    return {
        "usernum": user.usernum,
        "id": user.id,
        "nickname": user.nickname,
        "parents_name": user.parents_name,
        "parents_birth": user.parents_birth,
        "parents_gender": user.parents_gender,
        "parents_mbti": user.parents_mbti,
        "email": user.email,
        "region": user.region,
        "created_at": user.created_at,
        "children": children,
        "interest_regions": interest_regions,
        "interests": interests
    }


# 부모 기본정보 수정
def update_mypage(db: Session, usernum: int, request: MyPageUpdateRequest):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 닉네임 중복 확인
    existing_nickname = (
        db.query(User)
        .filter(User.nickname == request.nickname, User.usernum != usernum)
        .first()
    )

    if existing_nickname is not None:
        raise HTTPException(status_code=400, detail="이미 사용 중인 닉네임입니다.")

    # 이메일 중복 확인
    existing_email = (
        db.query(User)
        .filter(User.email == request.email, User.usernum != usernum)
        .first()
    )

    if existing_email is not None:
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    # 지역 명 검증
    if request.region not in ALLOWED_REGIONS:
        raise HTTPException(
            status_code=400,
            detail="허용되지 않은 지역입니다."
        )

    user.nickname = request.nickname
    user.parents_name = request.parents_name
    user.parents_birth = request.parents_birth
    user.parents_gender = request.parents_gender
    user.parents_mbti = request.parents_mbti
    user.email = request.email
    user.region = request.region

    db.commit()
    db.refresh(user)

    return {
        "message": "마이페이지 정보가 수정되었습니다.",
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



# 자녀 정보 목록 수정
def update_children(db: Session, usernum: int, request: ChildrenUpdateRequest):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 기존 자녀 정보 삭제
    db.query(Child).filter(Child.parentsnum == usernum).delete()

    # 새 자녀 정보 저장
    for child in request.children:
        new_child = Child(
            parentsnum=usernum,
            child_name=child.child_name,
            child_birth=child.child_birth,
            child_gender=child.child_gender
        )
        db.add(new_child)

    db.commit()

    return {"message": "자녀 정보가 수정되었습니다."}


# 관심지역 목록 수정
def update_interest_regions(
    db: Session,
    usernum: int,
    request: InterestRegionsUpdateRequest
):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if len(request.interest_regions) > 5:
        raise HTTPException(
            status_code=400,
            detail="관심지역은 최대 5개까지 등록할 수 있습니다."
        )

    unique_regions = list(dict.fromkeys(request.interest_regions))

    for region_name in unique_regions:
        if region_name not in ALLOWED_REGIONS:
            raise HTTPException(
                status_code=400,
                detail=f"허용되지 않은 관심지역입니다: {region_name}"
            )

    db.query(UserInterestRegion).filter(
        UserInterestRegion.interest_region_user == usernum
    ).delete()

    for region_name in unique_regions:
        new_region = UserInterestRegion(
            interest_region_user=usernum,
            region_name=region_name
        )
        db.add(new_region)

    db.commit()

    return {"message": "관심지역이 수정되었습니다."}


# 관심사 목록 수정
def update_interests(db: Session, usernum: int, request: InterestsUpdateRequest):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 중복 제거
    unique_interests = list(dict.fromkeys(request.interests))

    # 기존 관심사 삭제
    db.query(UserInterest).filter(
        UserInterest.interest_user == usernum
    ).delete()

    # 새 관심사 저장
    for interest_name in unique_interests:
        new_interest = UserInterest(
            interest_user=usernum,
            interest_name=interest_name
        )
        db.add(new_interest)

    db.commit()

    return {"message": "관심사가 수정되었습니다."}