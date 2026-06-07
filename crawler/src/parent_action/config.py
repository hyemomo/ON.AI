from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_DIR      = BASE_DIR / "data"
RAW_DIR       = DATA_DIR / "raw"
RAW_JSON_DIR  = DATA_DIR / "raw_json"
PROCESSED_DIR = DATA_DIR / "processed"

PARENT_ACTION_DIR = PROCESSED_DIR / "parent_action"
PARENT_ACTION_DIR.mkdir(parents=True, exist_ok=True)

PDF_PATH    = RAW_DIR / "parent_action.pdf"
JSON_PATH   = RAW_JSON_DIR / "parse_parent_action.json"
OUTPUT_PATH = PARENT_ACTION_DIR / "parent_action_cases.json"

CHROMA_DIR      = str(DATA_DIR / "chroma")
COLLECTION_NAME = "parent_action"
