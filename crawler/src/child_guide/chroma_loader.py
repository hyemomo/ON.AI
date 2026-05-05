import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import OUTPUT_PATH, CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL
from chroma_store import get_collection, save_chunks


def build_text(item: dict) -> str:
    """사례의 모든 텍스트 필드를 하나로 합쳐 임베딩용 문서 생성."""
    parts = [
        item.get("case_title", ""),
        item.get("situation", ""),
        item.get("cause_analysis", ""),
        item.get("guidance", ""),
        item.get("notes", ""),
    ]
    return "\n".join(p for p in parts if p).strip()


def main():
    print("child_action1_cases.json 로드 중...")
    data = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))

    chunks = []
    for item in data:
        chunks.append({
            "text": build_text(item),
            "metadata": {
                "source":       item["source"],
                "domain":       item["domain"],
                "case_number":  item["case_number"],
                "case_title":   item["case_title"],
                "age":          item.get("age", ""),
                "page_start":   int(item["page_start"]) if item.get("page_start") else 0,
                "page_end":     int(item["page_end"])   if item.get("page_end")   else 0,
            },
        })

    print(f"ChromaDB 적재 중... ({len(chunks)}개)")
    col = get_collection(CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL)
    save_chunks(col, chunks)
    print(f"완료: {len(chunks)}개 → 컬렉션 [{COLLECTION_NAME}]")


if __name__ == "__main__":
    main()
