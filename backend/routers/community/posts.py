from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.post_schema import PostCreate, PostUpdateRequest
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

# 게시글 수정
@router.put("/{postnum}")
def update_post_api(
        postnum: int,
        request: PostUpdateRequest,
        db: Session = Depends(get_db)
):
    return post_service.update_post(
        db=db,
        postnum=postnum,
        p_title=request.p_title,
        p_content=request.p_content,
        usernum=request.usernum
    )

# 게시글 삭제
@router.delete("/{postnum}")
def delete_post_api(
    postnum: int,
    usernum: int,
    db: Session = Depends(get_db)
):
    return post_service.delete_post(
        db=db,
        postnum=postnum,
        usernum=usernum
    )