"""ChromaDB 청크 내용 확인 스크립트.

사용법:
  python src/inspect_chunks.py              → 전체 목록 (미리보기 100자)
  python src/inspect_chunks.py 아동수당      → 해당 정책 전체 텍스트 출력
  python src/inspect_chunks.py --all        → 전체 청크 전문 출력
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "parent_policy"))

from config import CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL
import chromadb
from chromadb.utils import embedding_functions


def load_collection():
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    return client.get_collection(name=COLLECTION_NAME, embedding_function=ef)


def show_list(collection):
    result = collection.get(include=["documents", "metadatas"])
    docs = result["documents"]
    metas = result["metadatas"]

    print(f"\n총 {len(docs)}개 청크\n")
    print(f"{'#':<4} {'정책명':<33} {'카테고리':<10} {'미리보기'}")
    print("-" * 100)
    for i, (doc, m) in enumerate(zip(docs, metas), 1):
        preview = doc.replace("\n", " ")[:80]
        print(f"{i:<4} {m.get('policy_name',''):<33} {m.get('category',''):<10} {preview}")


def show_policy(collection, query: str):
    result = collection.get(include=["documents", "metadatas"])
    docs = result["documents"]
    metas = result["metadatas"]

    matches = [(doc, m) for doc, m in zip(docs, metas)
               if query in m.get("policy_name", "")]

    if not matches:
        print(f"'{query}' 와 일치하는 정책이 없습니다.")
        return

    for doc, m in matches:
        print(f"\n{'='*60}")
        print(f"정책명    : {m.get('policy_name')}")
        print(f"카테고리  : {m.get('category')}  |  소득기준: {m.get('income_criteria')}")
        print(f"지원유형  : {m.get('support_type')}  |  신청처: {m.get('application_place')}")
        print(f"페이지    : {m.get('page')}  |  대상: {m.get('family_type')}")
        print(f"{'='*60}")
        print(doc)


def show_all(collection):
    result = collection.get(include=["documents", "metadatas"])
    for doc, m in zip(result["documents"], result["metadatas"]):
        print(f"\n{'='*60}")
        print(f"[{m.get('policy_name')}] ({m.get('category')})")
        print(f"{'='*60}")
        print(doc)


if __name__ == "__main__":
    import warnings
    warnings.filterwarnings("ignore")

    col = load_collection()
    arg = sys.argv[1] if len(sys.argv) > 1 else None

    if arg is None:
        show_list(col)
    elif arg == "--all":
        show_all(col)
    else:
        show_policy(col, arg)
