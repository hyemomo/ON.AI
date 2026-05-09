from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.comment_schema import CommentCreate
from services import comment_service

router = APIRouter()


# 특정 게시글 댓글 조회
@router.get("/{postnum}")
def get_comments(postnum: int, db: Session = Depends(get_db)):
    comments = comment_service.get_comments_by_post(postnum, db)
    return {"comments": comments}


# 댓글 작성
@router.post("/")
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    result = comment_service.create_comment(comment, db)
    return result