from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.comment import Comment
from models.post import Post
from models.user import User
from schemas.comment_schema import CommentCreate, CommentUpdateRequest


# 특정 게시글의 댓글 조회
def get_comments_by_post(db: Session, postnum: int):
    comments = (
        db.query(Comment, User.nickname)
        .join(User, Comment.c_user == User.usernum)
        .filter(Comment.c_post == postnum)
        .order_by(Comment.commentnum.asc())
        .all()
    )

    result = []

    for comment, nickname in comments:
        result.append({
            "commentnum": comment.commentnum,
            "c_content": comment.c_content,
            "c_user": comment.c_user,
            "c_post": comment.c_post,
            "nickname": nickname,
            "c_created_at": comment.c_created_at
        })

    return result


# 댓글 작성
def create_comment(
    db: Session,
    comment_data: CommentCreate,
    usernum: int
):
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="존재하지 않는 사용자입니다.")

    post = db.query(Post).filter(Post.postnum == comment_data.c_post).first()

    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    new_comment = Comment(
        c_content=comment_data.c_content,
        c_user=usernum,
        c_post=comment_data.c_post
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "message": "댓글 작성 완료",
        "commentnum": new_comment.commentnum
    }


# 댓글 수정
def update_comment(
    db: Session,
    commentnum: int,
    request: CommentUpdateRequest,
    usernum: int
):
    comment = db.query(Comment).filter(Comment.commentnum == commentnum).first()

    if comment is None:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")

    if comment.c_user != usernum:
        raise HTTPException(status_code=403, detail="댓글 수정 권한이 없습니다.")

    comment.c_content = request.c_content

    db.commit()
    db.refresh(comment)

    return {
        "message": "댓글이 수정되었습니다.",
        "commentnum": comment.commentnum
    }


# 댓글 삭제
def delete_comment(db: Session, commentnum: int, usernum: int):
    comment = db.query(Comment).filter(Comment.commentnum == commentnum).first()

    if comment is None:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")

    if comment.c_user != usernum:
        raise HTTPException(status_code=403, detail="댓글 삭제 권한이 없습니다.")

    db.delete(comment)
    db.commit()

    return {"message": "댓글이 삭제되었습니다."}