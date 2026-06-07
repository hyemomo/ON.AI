from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # crawler/

JSON_PATH       = BASE_DIR / "data" / "raw_json" / "document_parse_result.json"
OUT_PATH        = BASE_DIR / "data" / "processed" / "parent_policy" / "policies.json"
CHROMA_DIR      = str(BASE_DIR / "data" / "chroma")
COLLECTION_NAME = "parent_policy"
