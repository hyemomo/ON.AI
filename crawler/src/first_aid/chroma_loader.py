import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from chroma_store import get_collection, save_chunks

BASE_DIR        = Path(__file__).resolve().parents[2]
JSON_PATH       = BASE_DIR / "data" / "processed" / "first_aid" / "first_aid_chunks.json"
CHROMA_DIR      = str(BASE_DIR / "data" / "chroma")
COLLECTION_NAME = "first_aid"
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"


def main():
    print("first_aid_chunks.json 로드 중...")
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))

    chunks = []
    for item in data:
        chunks.append({
            "text": item["document"],
            "metadata": {
                "source":      item["metadata"]["source"],
                "category":    item["metadata"]["category"] or "",
                "subcategory": item["metadata"]["subcategory"] or "",
                "title":       item["metadata"]["title"] or "",
                "topic_key":   item["metadata"]["topic_key"] or "",
            },
        })

    print(f"ChromaDB 적재 중... ({len(chunks)}개)")
    col = get_collection(CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL)
    save_chunks(col, chunks)
    print(f"완료: {len(chunks)}개 → 컬렉션 [{COLLECTION_NAME}]")


if __name__ == "__main__":
    main()
