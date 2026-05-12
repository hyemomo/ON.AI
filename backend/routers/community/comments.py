from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.comment_schema import CommentCreate, CommentUpdateRequest
from services import comment_service

router = APIRouter()


# 특정 게시글 댓글 조회
@router.get("/post/{postnum}")
def get_comments(postnum: int, db: Session = Depends(get_db)):
    comments = comment_service.get_comments_by_post(postnum, db)
    return {"comments": comments}


# 댓글 작성
@router.post("/")
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    result = comment_service.create_comment(comment, db)
    return result

# 댓글 수정
@router.put("/{commentnum}")
def update_comment_api(
    commentnum: int,
    request : CommentUpdateRequest,
    db: Session = Depends(get_db)
):
    return comment_service.update_comment(
        db=db,
        commentnum=commentnum,
        c_content=request.c_content,
        usernum=request.usernum
    )

# 댓글 삭제
@router.delete("/{commentnum}")
def delete_comment_api(
    commentnum: int,
    usernum: int,
    db: Session = Depends(get_db)
):
    return comment_service.delete_comment(
        db=db,
        commentnum=commentnum,
        usernum=usernum
    )