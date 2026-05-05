import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import OUT_PATH, CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL
from chroma_store import get_collection, save_chunks


def main():
    print("policies.json 로드 중...")
    data = json.loads(OUT_PATH.read_text(encoding="utf-8"))

    chunks = []
    for item in data:
        chunks.append({
            "text": item["text"],
            "metadata": {
                "policy_name":      item["policy_name"],
                "page":             item["page"],
                "category":         item["category"],
                "family_type":      item["family_type"],
                "income_criteria":  item["income_criteria"],
                "support_type":     item["support_type"],
                "application_place": item["application_place"],
            },
        })

    print(f"ChromaDB 적재 중... ({len(chunks)}개)")
    col = get_collection(CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL)
    save_chunks(col, chunks)
    print(f"완료: {len(chunks)}개 → 컬렉션 [{COLLECTION_NAME}]")


if __name__ == "__main__":
    main()
