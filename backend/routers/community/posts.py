from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.post_schema import PostCreate
from services import post_service

router = APIRouter()


# 게시글 전체 조회
@router.get("/")
def get_posts(db: Session = Depends(get_db)):
    posts = post_service.get_all_posts(db)
    return {"posts": posts}


# 게시글 상세 조회
@router.get("/{postnum}")
def get_post(postnum: int, db: Session = Depends(get_db)):
    post = post_service.get_post_by_id(postnum, db)
    return {"post": post}


# 게시글 작성
@router.post("/")
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    result = post_service.create_post(post, db)
    return result