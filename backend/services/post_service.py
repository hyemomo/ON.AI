import os
import uuid
import shutil
from datetime import datetime, timedelta

from fastapi import HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from constants import (
    ALLOWED_CATEGORIES,
    ALLOWED_REGIONS,
    ALLOWED_SORT_OPTIONS,
    POPULAR_PERIOD_DAYS
)
from models.comment import Comment
from models.photo_image import PhotoImage
from models.post import Post
from models.post_like import PostLike
from models.user import User
from schemas.post_schema import PostUpdateRequest


UPLOAD_DIR = "static/post_images"


# 지역 태그 검증
def validate_region(region: str):
    if region not in ALLOWED_REGIONS:
        raise HTTPException(
            status_code=400,
            detail="허용되지 않은 지역입니다."
        )


# 카테고리 태그 검증
def validate_category(category: str):
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="허용되지 않은 카테고리입니다."
        )


# 정렬 옵션 검증
def validate_sort_option(sort: str):
    if sort not in ALLOWED_SORT_OPTIONS:
        raise HTTPException(
            status_code=400,
            detail="허용되지 않은 정렬 옵션입니다."
        )


# 이미지 파일 형식 검증
def validate_image_file(image: UploadFile):
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"]

    if image.filename is None:
        raise HTTPException(
            status_code=400,
            detail="파일 이름이 올바르지 않습니다."
        )

    file_extension = os.path.splitext(image.filename)[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="jpg, jpeg, png, webp 형식의 이미지만 업로드할 수 있습니다."
        )


# 게시글 전체 조회
# 지역/카테고리 필터 + 최신순/댓글순/인기순 정렬
def get_all_posts(
    db: Session,
    usernum: int,
    region: str | None = None,
    category: str | None = None,
    sort: str = "latest"
):
    if region is not None:
        validate_region(region)

    if category is not None:
        validate_category(category)

    validate_sort_option(sort)

    query = (
        db.query(
            Post,
            User.nickname,
            func.count(Comment.commentnum.distinct()).label("comment_count"),
            func.count(PostLike.likenum.distinct()).label("like_count")
        )
        .join(User, Post.p_user == User.usernum)
        .outerjoin(Comment, Comment.c_post == Post.postnum)
        .outerjoin(PostLike, PostLike.like_postnum == Post.postnum)
    )

    if region is not None:
        query = query.filter(Post.p_region_tag == region)

    if category is not None:
        query = query.filter(Post.p_category_tag == category)

    if sort == "popular":
        recent_date = datetime.now() - timedelta(days=POPULAR_PERIOD_DAYS)
        query = query.filter(Post.p_created_at >= recent_date)

    query = query.group_by(
        Post.postnum,
        Post.p_title,
        Post.p_content,
        Post.p_user,
        Post.p_region_tag,
        Post.p_category_tag,
        Post.p_created_at,
        User.nickname
    )

    if sort == "comments":
        query = query.order_by(
            func.count(Comment.commentnum.distinct()).desc(),
            Post.postnum.desc()
        )

    elif sort == "popular":
        query = query.order_by(
            (
                func.count(PostLike.likenum.distinct()) * 2
                + func.count(Comment.commentnum.distinct())
            ).desc(),
            Post.postnum.desc()
        )

    else:
        query = query.order_by(Post.postnum.desc())

    posts = query.all()

    result = []

    for post, nickname, comment_count, like_count in posts:
        is_liked = (
            db.query(PostLike)
            .filter(
                PostLike.like_postnum == post.postnum,
                PostLike.like_usernum == usernum
            )
            .first()
            is not None
        )

        image_urls = [
            image.image_url
            for image in post.photo_images
        ]

        result.append({
            "postnum": post.postnum,
            "p_title": post.p_title,
            "p_content": post.p_content,
            "p_user": post.p_user,
            "nickname": nickname,
            "p_region_tag": post.p_region_tag,
            "p_category_tag": post.p_category_tag,
            "p_created_at": post.p_created_at,
            "comment_count": comment_count,
            "like_count": like_count,
            "is_liked": is_liked,
            "image_urls": image_urls
        })

    return result


# 특정 게시글 조회
def get_post_by_id(db: Session, postnum: int, usernum: int):
    result = (
        db.query(
            Post,
            User.nickname,
            func.count(Comment.commentnum.distinct()).label("comment_count"),
            func.count(PostLike.likenum.distinct()).label("like_count")
        )
        .join(User, Post.p_user == User.usernum)
        .outerjoin(Comment, Comment.c_post == Post.postnum)
        .outerjoin(PostLike, PostLike.like_postnum == Post.postnum)
        .filter(Post.postnum == postnum)
        .group_by(
            Post.postnum,
            Post.p_title,
            Post.p_content,
            Post.p_user,
            Post.p_region_tag,
            Post.p_category_tag,
            Post.p_created_at,
            User.nickname
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="게시글이 없습니다."
        )

    post, nickname, comment_count, like_count = result

    is_liked = (
        db.query(PostLike)
        .filter(
            PostLike.like_postnum == post.postnum,
            PostLike.like_usernum == usernum
        )
        .first()
        is not None
    )

    image_urls = [
        image.image_url
        for image in post.photo_images
    ]

    return {
        "postnum": post.postnum,
        "p_title": post.p_title,
        "p_content": post.p_content,
        "p_user": post.p_user,
        "nickname": nickname,
        "p_region_tag": post.p_region_tag,
        "p_category_tag": post.p_category_tag,
        "p_created_at": post.p_created_at,
        "comment_count": comment_count,
        "like_count": like_count,
        "is_liked": is_liked,
        "image_urls": image_urls
    }


# 게시글 작성
# 사진은 작성 시에만 업로드 가능
def create_post(
    db: Session,
    usernum: int,
    p_title: str,
    p_content: str,
    p_region_tag: str,
    p_category_tag: str,
    images: list[UploadFile]
):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="존재하지 않는 사용자입니다."
        )

    validate_region(p_region_tag)
    validate_category(p_category_tag)

    new_post = Post(
        p_title=p_title,
        p_content=p_content,
        p_user=usernum,
        p_region_tag=p_region_tag,
        p_category_tag=p_category_tag
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    for image in images:
        if image.filename is None or image.filename == "":
            continue

        validate_image_file(image)

        file_extension = os.path.splitext(image.filename)[1].lower()
        saved_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, saved_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"/static/post_images/{saved_filename}"

        new_image = PhotoImage(
            image_postnum=new_post.postnum,
            image_url=image_url
        )

        db.add(new_image)

    db.commit()

    return {
        "message": "게시글 작성 완료",
        "postnum": new_post.postnum
    }


# 게시글 수정
# 사진 추가, 삭제, 교체는 허용하지 않음
def update_post(
    db: Session,
    postnum: int,
    post_data: PostUpdateRequest,
    usernum: int
):
    post = db.query(Post).filter(Post.postnum == postnum).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="게시글을 찾을 수 없습니다."
        )

    if post.p_user != usernum:
        raise HTTPException(
            status_code=403,
            detail="게시글 수정 권한이 없습니다."
        )

    validate_region(post_data.p_region_tag)
    validate_category(post_data.p_category_tag)

    post.p_title = post_data.p_title
    post.p_content = post_data.p_content
    post.p_region_tag = post_data.p_region_tag
    post.p_category_tag = post_data.p_category_tag

    db.commit()
    db.refresh(post)

    return {
        "message": "게시글이 수정되었습니다.",
        "postnum": post.postnum
    }


# 게시글 삭제
def delete_post(db: Session, postnum: int, usernum: int):
    post = db.query(Post).filter(Post.postnum == postnum).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="게시글을 찾을 수 없습니다."
        )

    if post.p_user != usernum:
        raise HTTPException(
            status_code=403,
            detail="게시글 삭제 권한이 없습니다."
        )

    # DB에서 게시글을 삭제하기 전에 실제 이미지 파일도 삭제
    for image in post.photo_images:
        file_path = image.image_url.lstrip("/")

        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(post)
    db.commit()

    return {"message": "게시글이 삭제되었습니다."}