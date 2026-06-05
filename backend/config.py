from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR        = Path(__file__).resolve().parent
CHROMA_DIR      = str(BASE_DIR.parent / "crawler" / "data" / "chroma")
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GOOGLE_STT_KEY = str(BASE_DIR / "keys" / "kun-kgp-chlwogur68-131b84128103.json")
GOOGLE_APPLICATION_CREDENTIALS = str(BASE_DIR / "keys" / "kun-kgp-chlwogur68-131b84128103.json")
GOOGLE_CLOUD_PROJECT = "kun-kgp-chlwogur68"
