from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers.chat import router as chat_router
from routers.stt import router as stt_router
from routers import auth
from routers import mypage
from routers import matching
from routers import matching_requests
from routers import chats
from routers.community import posts, comments

app = FastAPI(
    title="ON.AI API",
    description="ON.AI 챗봇 및 커뮤니티 API",
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
app.mount("/static", StaticFiles(directory="static"), name="static")

# 챗봇 API
app.include_router(chat_router, prefix="/api")
app.include_router(stt_router, prefix="/api")

# 커뮤니티 API
app.include_router(posts.router, prefix="/community/posts", tags=["Community Posts"])
app.include_router(comments.router, prefix="/community/comments", tags=["Community Comments"])

# 인증 API
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

# 마이페이지 API
app.include_router(mypage.router, prefix="/mypage", tags=["mypage"])

# AI 육아친구 추천 API 등록
app.include_router(
    matching.router,
    prefix="/matching",
    tags=["AI Matching"]
)

# 친해져요 요청/수락/매칭 완료 API 등록
app.include_router(
    matching_requests.router,
    prefix="/matching",
    tags=["Matching Requests"]
)

# 매칭 완료 후 1:1 채팅 API 등록
app.include_router(
    chats.router,
    prefix="/chats",
    tags=["Chats"]
)


@app.get("/")
def root():
    return {"message": "ON.AI server is running"}
