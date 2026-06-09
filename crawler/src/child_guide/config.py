from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
DEBUG_DIR = DATA_DIR / "debug"

CHILD_GUIDE_PROCESSED_DIR = PROCESSED_DIR / "child_guides"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
DEBUG_DIR.mkdir(parents=True, exist_ok=True)
CHILD_GUIDE_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

PDF_PATH = RAW_DIR / "child_action1.pdf"

OUTPUT_PATH = CHILD_GUIDE_PROCESSED_DIR / "child_action1_cases.json"

CHROMA_DIR      = str(DATA_DIR / "chroma")
COLLECTION_NAME = "child_guide"