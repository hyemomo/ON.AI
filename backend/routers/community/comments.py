from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.comment_schema import CommentCreate, CommentUpdateRequest
from services import comment_service
from dependencies import get_current_user
from models.user import User

router = APIRouter()


# 특정 게시글의 댓글 조회
@router.get("/post/{postnum}")
def get_comments_by_post(
    postnum: int,
    db: Session = Depends(get_db)
):
    comments = comment_service.get_comments_by_post(db, postnum)
    return {"comments": comments}


# 댓글 작성
@router.post("/")
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_service.create_comment(
        db=db,
        comment_data=comment,
        usernum=current_user.usernum
    )


# 댓글 수정
@router.put("/{commentnum}")
def update_comment_api(
    commentnum: int,
    request: CommentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_service.update_comment(
        db=db,
        commentnum=commentnum,
        request=request,
        usernum=current_user.usernum
    )


# 댓글 삭제
@router.delete("/{commentnum}")
def delete_comment_api(
    commentnum: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_service.delete_comment(
        db=db,
        commentnum=commentnum,
        usernum=current_user.usernum
    )