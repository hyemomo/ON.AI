import os
import shutil
import uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile

from constants import ALLOWED_REGIONS, INTERESTS

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


PROFILE_IMAGE_UPLOAD_DIR = "static/profile_images"
MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_PROFILE_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]


# 프로필 이미지 파일 형식 검증
def validate_profile_image_file(profile_image: UploadFile):
    if profile_image.filename is None or profile_image.filename == "":
        raise HTTPException(
            status_code=400,
            detail="파일 이름이 올바르지 않습니다."
        )

    file_extension = os.path.splitext(profile_image.filename)[1].lower()

    if file_extension not in ALLOWED_PROFILE_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="jpg, jpeg, png, webp 형식의 이미지만 업로드할 수 있습니다."
        )


# 프로필 이미지 파일 크기 검증
def validate_profile_image_size(profile_image: UploadFile):
    profile_image.file.seek(0, os.SEEK_END)
    file_size = profile_image.file.tell()
    profile_image.file.seek(0)

    if file_size > MAX_PROFILE_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="프로필 이미지는 5MB 이하만 업로드할 수 있습니다."
        )


# 기존 프로필 이미지 파일 삭제
def delete_old_profile_image(profile_image_url: str | None):
    if profile_image_url is None:
        return

    if not profile_image_url.startswith("/static/profile_images/"):
        return

    old_file_path = profile_image_url.lstrip("/")

    if os.path.exists(old_file_path):
        os.remove(old_file_path)


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
        "profile_image_url": user.profile_image_url,
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
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at
        }
    }


# 프로필 이미지 수정
def update_profile_image(
    db: Session,
    usernum: int,
    profile_image: UploadFile
):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    validate_profile_image_file(profile_image)
    validate_profile_image_size(profile_image)

    os.makedirs(PROFILE_IMAGE_UPLOAD_DIR, exist_ok=True)

    file_extension = os.path.splitext(profile_image.filename)[1].lower()
    saved_filename = f"user_{usernum}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(PROFILE_IMAGE_UPLOAD_DIR, saved_filename)

    delete_old_profile_image(user.profile_image_url)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(profile_image.file, buffer)

    profile_image_url = f"/static/profile_images/{saved_filename}"

    user.profile_image_url = profile_image_url

    db.commit()
    db.refresh(user)

    return {
        "message": "프로필 이미지가 수정되었습니다.",
        "profile_image_url": user.profile_image_url
    }


# 프로필 이미지 삭제
def delete_profile_image(db: Session, usernum: int):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if user.profile_image_url is None:
        return {
            "message": "삭제할 프로필 이미지가 없습니다.",
            "profile_image_url": None
        }

    delete_old_profile_image(user.profile_image_url)

    user.profile_image_url = None

    db.commit()
    db.refresh(user)

    return {
        "message": "프로필 이미지가 삭제되었습니다.",
        "profile_image_url": None
    }


# 자녀 정보 목록 수정
def update_children(db: Session, usernum: int, request: ChildrenUpdateRequest):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if len(request.children) > 1:
        raise HTTPException(
            status_code=400,
            detail="아이 정보는 1명만 등록할 수 있습니다."
        )

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

    if len(unique_interests) > 3:
        raise HTTPException(
            status_code=400,
            detail="관심사는 최대 3개까지 등록할 수 있습니다."
        )

    for interest_name in unique_interests:
        if interest_name not in INTERESTS:
            raise HTTPException(
                status_code=400,
                detail=f"허용되지 않은 관심사입니다: {interest_name}"
            )

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