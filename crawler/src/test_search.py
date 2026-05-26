"""실제 RAG 파이프라인과 동일한 벡터 유사도 검색 테스트.

사용법:
  python src/test_search.py "아동양육비"
  python src/test_search.py "주거 지원" --collection parent_policy --category 시설주거
  python src/test_search.py "열이 나요" --collection first_aid
  python src/test_search.py "이유식" --collection parent_action
  python src/test_search.py "친구랑 싸웠어요" --collection child_guide
  python src/test_search.py "아동양육비" --n 10
"""
import sys
import argparse
import warnings
warnings.filterwarnings("ignore")

from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import chromadb
from chromadb.utils import embedding_functions
from chroma_store import EMBEDDING_MODEL

BASE_DIR   = Path(__file__).resolve().parents[1]
CHROMA_DIR = str(BASE_DIR / "data" / "chroma")

MAX_DISTANCE = 0.5


def query_collection(collection_name: str, query: str, n_results: int, category: str | None):
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    col = client.get_collection(name=collection_name, embedding_function=ef)

    where = None
    if category and collection_name == "parent_policy":
        where = {"category": category}

    kwargs = dict(query_texts=[query], n_results=n_results, include=["documents", "metadatas", "distances"])
    if where:
        kwargs["where"] = where

    try:
        result = col.query(**kwargs)
    except Exception:
        kwargs.pop("where", None)
        result = col.query(**kwargs)

    docs      = result["documents"][0]
    metas     = result["metadatas"][0]
    distances = result["distances"][0]

    print(f"\n{'='*70}")
    print(f"검색어   : {query!r}")
    print(f"컬렉션   : {collection_name}   (임베딩 모델: {EMBEDDING_MODEL})")
    if category:
        print(f"카테고리 : {category}")
    print(f"임계값   : MAX_DISTANCE = {MAX_DISTANCE}  (이하만 유효)")
    print(f"{'='*70}\n")

    passed = 0
    for rank, (doc, meta, dist) in enumerate(zip(docs, metas, distances), 1):
        flag = "✅" if dist <= MAX_DISTANCE else "❌"
        title = (
            meta.get("policy_name")
            or meta.get("case_title")
            or meta.get("title")
            or meta.get("category")
            or "(제목 없음)"
        )
        preview = doc.replace("\n", " ")[:120]

        print(f"[{rank}] {flag}  거리: {dist:.4f}   {title}")
        print(f"     미리보기: {preview}")
        if collection_name == "parent_policy":
            print(f"     카테고리: {meta.get('category','')}  |  지원유형: {meta.get('support_type','')}  |  신청처: {meta.get('application_place','')}")
        elif collection_name in ("parent_action", "child_guide"):
            print(f"     연령: {meta.get('age','')}  |  도메인: {meta.get('domain','')}")
        elif collection_name == "first_aid":
            print(f"     카테고리: {meta.get('category','')}  |  소분류: {meta.get('subcategory','')}")
        print()
        if dist <= MAX_DISTANCE:
            passed += 1

    print(f"--- 임계값 통과: {passed}/{len(docs)}개 ---")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser()
    parser.add_argument("query", help="검색할 자연어 질문")
    parser.add_argument("--collection", default="parent_policy",
                        choices=["parent_policy", "parent_action", "child_guide", "first_aid"])
    parser.add_argument("--category", default=None,
                        help="parent_policy 카테고리 필터 (임신출산/양육돌봄/시설주거/교육취업/금융법률)")
    parser.add_argument("--n", type=int, default=5, help="검색 결과 수 (기본 5)")
    args = parser.parse_args()

    query_collection(args.collection, args.query, args.n, args.category)
