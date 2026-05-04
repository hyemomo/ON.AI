from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR    = BASE_DIR / "data" / "raw"
CHROMA_DIR = BASE_DIR / "data" / "chroma"
JSON_DIR   = BASE_DIR / "data" / "raw_json"

PDF_FILENAME     = "parent_policy.pdf"
JSON_FILENAME    = "document_parse_result.json"
COLLECTION_NAME  = "hanbumo_welfare"
EMBEDDING_MODEL  = "paraphrase-multilingual-MiniLM-L12-v2"
