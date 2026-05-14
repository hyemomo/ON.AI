from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.post import Post
from models.user import User
from schemas.post_schema import PostCreate


# 게시글 전체 조회
def get_all_posts(db: Session):
    posts = (
        db.query(Post, User.nickname)
        .join(User, Post.p_user == User.usernum)
        .order_by(Post.postnum.desc())
        .all()
    )

    result = []

    for post, nickname in posts:
        result.append({
            "postnum": post.postnum,
            "p_title": post.p_title,
            "p_content": post.p_content,
            "p_user": post.p_user,
            "nickname": nickname,
            "p_created_at": post.p_created_at
        })

    return result


# 특정 게시글 조회
def get_post_by_id(postnum: int, db: Session):
    result = (
        db.query(Post, User.nickname)
        .join(User, Post.p_user == User.usernum)
        .filter(Post.postnum == postnum)
        .first()
    )

    if result is None:
        raise HTTPException(status_code=404, detail="게시글이 없습니다.")

    post, nickname = result

    return {
        "postnum": post.postnum,
        "p_title": post.p_title,
        "p_content": post.p_content,
        "p_user": post.p_user,
        "nickname": nickname,
        "p_created_at": post.p_created_at
    }


# 게시글 작성
def create_post(post_data: PostCreate, db: Session):
    user = db.query(User).filter(User.usernum == post_data.p_user).first()

    if user is None:
        raise HTTPException(status_code=404, detail="존재하지 않는 사용자입니다.")

    new_post = Post(
        p_title=post_data.p_title,
        p_content=post_data.p_content,
        p_user=post_data.p_user
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "message": "게시글 작성 완료",
        "postnum": new_post.postnum
    }

# 게시글 수정
def update_post(db: Session, postnum: int, p_title: str, p_content: str, usernum: int):
    post = db.query(Post).filter(Post.postnum == postnum).first()

    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    
    if post.p_user != usernum:
        raise HTTPException(status_code=403, detail="게시글 수정 권한이 없습니다.")
    
    post.p_title = p_title
    post.p_content = p_content

    db.commit()
    db.refresh(post)

    return post

# 게시글 삭제
def delete_post(db: Session, postnum: int, usernum: int):
    post = db.query(Post).filter(Post.postnum == postnum).first()

    if post is None:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    
    if post.p_user != usernum:
        raise HTTPException(status_code=403, detail="게시글 삭제 권한이 없습니다.")
    
    db.delete(post)
    db.commit()

    return {"message": "게시글이 삭제되었습니다."}