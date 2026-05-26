from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # crawler/

JSON_PATH       = BASE_DIR / "data" / "processed" / "first_aid" / "first_aid_chunks.json"
CHROMA_DIR      = str(BASE_DIR / "data" / "chroma")
COLLECTION_NAME = "first_aid"
