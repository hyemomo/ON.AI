import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from urllib.parse import quote_plus


# 데이터베이스 연결 설정
# .env 파일에 비밀번호 안전하게 저장해주세요!
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD", ""))
DB_NAME = os.getenv("DB_NAME", "onai")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
engine = create_engine(DATABASE_URL, echo=True)

# DB 세션 생성
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# API 요청마다 DB 세션 생성 및 종료
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()