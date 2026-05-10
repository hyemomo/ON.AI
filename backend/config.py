from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR        = Path(__file__).resolve().parent
CHROMA_DIR      = str(BASE_DIR.parent / "crawler" / "data" / "chroma")
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
