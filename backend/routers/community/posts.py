from fastapi import APIRouter, Depends, Query, Form, File, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.user import User
from schemas.post_schema import PostUpdateRequest
from services import post_service, post_like_service

router = APIRouter()


# 게시글 전체 조회
# region, category, sort는 선택값
@router.get("/")
def get_posts(
    region: str | None = Query(default=None),
    category: str | None = Query(default=None),
    sort: str = Query(default="latest"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    posts = post_service.get_all_posts(
        db=db,
        usernum=current_user.usernum,
        region=region,
        category=category,
        sort=sort
    )

    return {"posts": posts}


# 게시글 상세 조회
@router.get("/{postnum}")
def get_post(
    postnum: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = post_service.get_post_by_id(
        db=db,
        postnum=postnum,
        usernum=current_user.usernum
    )

    return {"post": post}


# 게시글 작성
# 사진은 게시글 작성 시에만 업로드할 수 있음
# 게시글 작성 시, 사진은 10장까지만 업로드 가능하도록 제한하였습니다.
@router.post("/")
def create_post(
    p_title: str = Form(...),
    p_content: str = Form(...),
    p_region_tag: str = Form(...),
    p_category_tag: str = Form(...),
    image_1: UploadFile | None = File(default=None),
    image_2: UploadFile | None = File(default=None),
    image_3: UploadFile | None = File(default=None),
    image_4: UploadFile | None = File(default=None),
    image_5: UploadFile | None = File(default=None),
    image_6: UploadFile | None = File(default=None),
    image_7: UploadFile | None = File(default=None),
    image_8: UploadFile | None = File(default=None),
    image_9: UploadFile | None = File(default=None),
    image_10: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    images = [
        image
        for image in [image_1, image_2, image_3, image_4, image_5, image_6, image_7, image_8, image_9, image_10]
        if image is not None
    ]

    return post_service.create_post(
        db=db,
        usernum=current_user.usernum,
        p_title=p_title,
        p_content=p_content,
        p_region_tag=p_region_tag,
        p_category_tag=p_category_tag,
        images=images
    )


# 게시글 수정
# 사진 추가, 삭제, 교체는 허용하지 않음
@router.put("/{postnum}")
def update_post_api(
    postnum: int,
    request: PostUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return post_service.update_post(
        db=db,
        postnum=postnum,
        post_data=request,
        usernum=current_user.usernum
    )


# 게시글 삭제
@router.delete("/{postnum}")
def delete_post_api(
    postnum: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return post_service.delete_post(
        db=db,
        postnum=postnum,
        usernum=current_user.usernum
    )


# 게시글 좋아요 누르기
@router.post("/{postnum}/likes")
def create_post_like(
    postnum: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return post_like_service.create_post_like(
        db=db,
        postnum=postnum,
        usernum=current_user.usernum
    )


# 게시글 좋아요 취소
@router.delete("/{postnum}/likes")
def delete_post_like(
    postnum: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return post_like_service.delete_post_like(
        db=db,
        postnum=postnum,
        usernum=current_user.usernum
    )