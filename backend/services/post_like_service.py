from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.post import Post
from models.post_like import PostLike


# 게시글 좋아요 누르기
def create_post_like(postnum: int, usernum: int, db: Session):
    post = db.query(Post).filter(Post.postnum == postnum).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="게시글을 찾을 수 없습니다."
        )

    existing_like = (
        db.query(PostLike)
        .filter(
            PostLike.like_postnum == postnum,
            PostLike.like_usernum == usernum
        )
        .first()
    )

    if existing_like is not None:
        raise HTTPException(
            status_code=400,
            detail="이미 좋아요를 누른 게시글입니다."
        )

    new_like = PostLike(
        like_postnum=postnum,
        like_usernum=usernum
    )

    db.add(new_like)
    db.commit()
    db.refresh(new_like)

    return {
        "postnum": postnum,
        "is_liked": True
    }


# 게시글 좋아요 취소
def delete_post_like(db: Session, postnum: int, usernum: int):
    post_like = (
        db.query(PostLike)
        .filter(
            PostLike.like_postnum == postnum,
            PostLike.like_usernum == usernum
        )
        .first()
    )

    if post_like is None:
        raise HTTPException(
            status_code=404,
            detail="좋아요를 누르지 않은 게시글입니다."
        )

    db.delete(post_like)
    db.commit()

    return {
        "postnum": postnum,
        "is_liked": False
    }