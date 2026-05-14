from fastapi import FastAPI
from routers.community import posts, comments

# FastAPI 메인 서버 생성
app = FastAPI(
    title="ON-AI Community API",
    description="ON-AI 커뮤니티 기능 API",
    version="1.0.0"
)

# 커뮤니티 게시글 API 등록
app.include_router(
    posts.router,
    prefix="/community/posts",
    tags=["Community Posts"]
)

# 커뮤니티 댓글 API 등록
app.include_router(
    comments.router,
    prefix="/community/comments",
    tags=["Community Comments"]
)


# 서버 실행 확인용 기본 API
@app.get("/")
def root():
    return {"message": "ON-AI backend server is running"}