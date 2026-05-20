from fastapi import FastAPI
from routers import auth
from routers import mypage
from routers.community import posts, comments
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# FastAPI 메인 서버 생성
app = FastAPI(
    title="ON-AI Community API",
    description="ON-AI 커뮤니티 기능 API",
    version="1.0.0"
)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일
app.mount(
    "/static", 
    StaticFiles(directory="static"), 
    name="static"
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

# 로그인/회원가입 API 등록
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"]
)

# 마이페이지 API 등록
app.include_router(
    mypage.router,
    prefix="/mypage",
    tags=["mypage"]
)


# 서버 실행 확인용 기본 API
@app.get("/")
def root():
    return {"message": "ON-AI backend server is running"}