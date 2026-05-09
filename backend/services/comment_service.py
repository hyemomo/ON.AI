from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.comment import Comment
from models.user import User
from models.post import Post
from schemas.comment_schema import CommentCreate


# 특정 게시글의 댓글 목록 조회
def get_comments_by_post(postnum: int, db: Session):
    post = db.query(Post).filter(Post.postnum == postnum).first()

    if post is None:
        raise HTTPException(status_code=404, detail="게시글이 없습니다.")

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
            "nickname": nickname,
            "c_post": comment.c_post,
            "c_created_at": comment.c_created_at
        })

    return result


# 댓글 작성 
def create_comment(comment_data: CommentCreate, db: Session):
    user = db.query(User).filter(User.usernum == comment_data.c_user).first()

    if user is None:
        raise HTTPException(status_code=404, detail="존재하지 않는 사용자입니다.")

    post = db.query(Post).filter(Post.postnum == comment_data.c_post).first()

    if post is None:
        raise HTTPException(status_code=404, detail="게시글이 없습니다.")

    new_comment = Comment(
        c_content=comment_data.c_content,
        c_user=comment_data.c_user,
        c_post=comment_data.c_post
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "message": "댓글 작성 완료",
        "commentnum": new_comment.commentnum
    }