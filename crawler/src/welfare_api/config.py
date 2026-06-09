from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # crawler/

load_dotenv(BASE_DIR / ".env")

API_KEY        = os.getenv("WELFARE_API_KEY", "")
BASE_URL       = "http://apis.data.go.kr/B554287/NationalWelfareInformationsV001"
LIST_URL       = f"{BASE_URL}/NationalWelfarelistV001"
DETAIL_URL     = f"{BASE_URL}/NationalWelfaredetailedV001"

OUT_DIR        = BASE_DIR / "data" / "processed" / "welfare_api"
OUT_JSON       = OUT_DIR / "welfare_services.json"

CHROMA_DIR     = str(BASE_DIR / "data" / "chroma")
COLLECTION_NAME = "parent_policy"

# 한부모·조손(060) + 저소득(050) 가구유형 필터
TARGET_CODES = ["060", "050"]

# 생애주기 필터 (임신·출산, 영유아, 아동, 청소년)
LIFE_CODES = ["007", "001", "002", "003"]
