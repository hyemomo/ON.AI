from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # crawler/

JSON_PATH       = BASE_DIR / "data" / "raw_json" / "document_parse_result.json"
OUT_PATH        = BASE_DIR / "data" / "policies.json"
CHROMA_DIR      = str(BASE_DIR / "data" / "chroma")
COLLECTION_NAME = "hanbumo_welfare"
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"
