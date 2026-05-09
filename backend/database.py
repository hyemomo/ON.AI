from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 데이터베이스 연결 설정
# 각자 로컬 MySQL 비밀번호에 맞게 <YOUR_PASSWORD> 부분을 변경해서 사용하시면 됩니다. <>도 포함해서 지우고 입력해 주세요!
DATABASE_URL = "mysql+pymysql://root:<YOUR_PASSWORD>@localhost/onai"

# SQLAlchemy 엔진 생성
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