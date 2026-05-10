"""ChromaDB 청크 내용 확인 스크립트.

사용법:
  python src/inspect_chunks.py                                      → parent_policy 목록
  python src/inspect_chunks.py --collection child_guide             → child_guide 목록
  python src/inspect_chunks.py --collection parent_action           → parent_action 목록
  python src/inspect_chunks.py --collection first_aid               → first_aid 목록
  python src/inspect_chunks.py 아동수당                             → parent_policy 검색
  python src/inspect_chunks.py --collection parent_action 이유식    → parent_action 검색
  python src/inspect_chunks.py --collection first_aid 화상          → first_aid 검색
  python src/inspect_chunks.py --all                                → parent_policy 전문
  python src/inspect_chunks.py --collection first_aid --all         → first_aid 전문
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "parent_policy"))
sys.path.insert(0, str(Path(__file__).parent / "child_guide"))

import chromadb
from chromadb.utils import embedding_functions

EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"

BASE_DIR = Path(__file__).resolve().parents[1]
CHROMA_DIR = str(BASE_DIR / "data" / "chroma")


def load_collection(collection_name: str):
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    return client.get_collection(name=collection_name, embedding_function=ef)


# ── parent_policy 출력 ──────────────────────────────────────────────────────

def show_list_policy(collection):
    result = collection.get(include=["documents", "metadatas"])
    docs, metas = result["documents"], result["metadatas"]
    print(f"\n[parent_policy] 총 {len(docs)}개 청크\n")
    print(f"{'#':<4} {'정책명':<33} {'카테고리':<10} {'미리보기'}")
    print("-" * 100)
    for i, (doc, m) in enumerate(zip(docs, metas), 1):
        preview = doc.replace("\n", " ")[:80]
        print(f"{i:<4} {m.get('policy_name',''):<33} {m.get('category',''):<10} {preview}")


def show_query_policy(collection, query: str):
    result = collection.get(include=["documents", "metadatas"])
    matches = [(doc, m) for doc, m in zip(result["documents"], result["metadatas"])
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


def show_all_policy(collection):
    result = collection.get(include=["documents", "metadatas"])
    for doc, m in zip(result["documents"], result["metadatas"]):
        print(f"\n{'='*60}")
        print(f"[{m.get('policy_name')}] ({m.get('category')})")
        print(f"{'='*60}")
        print(doc)


# ── child_guide 출력 ────────────────────────────────────────────────────────

def show_list_child(collection):
    result = collection.get(include=["documents", "metadatas"])
    docs, metas = result["documents"], result["metadatas"]
    print(f"\n[child_guide] 총 {len(docs)}개 청크\n")
    print(f"{'#':<4} {'사례 제목':<40} {'연령':<8} {'미리보기'}")
    print("-" * 100)
    for i, (doc, m) in enumerate(zip(docs, metas), 1):
        preview = doc.replace("\n", " ")[:60]
        print(f"{i:<4} {m.get('case_title',''):<40} {m.get('age',''):<8} {preview}")


def show_query_child(collection, query: str):
    result = collection.get(include=["documents", "metadatas"])
    matches = [(doc, m) for doc, m in zip(result["documents"], result["metadatas"])
               if query in m.get("case_title", "") or query in doc]
    if not matches:
        print(f"'{query}' 와 일치하는 사례가 없습니다.")
        return
    for doc, m in matches:
        print(f"\n{'='*60}")
        print(f"사례 제목  : {m.get('case_title')}")
        print(f"사례 번호  : {m.get('case_number')}  |  연령: {m.get('age')}")
        print(f"도메인     : {m.get('domain')}  |  출처: {m.get('source')}")
        print(f"페이지     : {m.get('page_start')} ~ {m.get('page_end')}")
        print(f"{'='*60}")
        print(doc)


def show_all_child(collection):
    result = collection.get(include=["documents", "metadatas"])
    for doc, m in zip(result["documents"], result["metadatas"]):
        print(f"\n{'='*60}")
        print(f"[{m.get('case_title')}] (사례 {m.get('case_number')})")
        print(f"{'='*60}")
        print(doc)


# ── parent_action 출력 ─────────────────────────────────────────────────────

def show_list_parent_action(collection):
    result = collection.get(include=["documents", "metadatas"])
    docs, metas = result["documents"], result["metadatas"]
    print(f"\n[parent_action] 총 {len(docs)}개 청크\n")
    print(f"{'#':<4} {'사례 제목':<40} {'영역':<16} {'연령':<6} {'미리보기'}")
    print("-" * 110)
    for i, (doc, m) in enumerate(zip(docs, metas), 1):
        preview = doc.replace("\n", " ")[:40]
        print(f"{i:<4} {m.get('case_title',''):<40} {m.get('domain',''):<16} {m.get('age',''):<6} {preview}")


def show_query_parent_action(collection, query: str):
    result = collection.get(include=["documents", "metadatas"])
    matches = [(doc, m) for doc, m in zip(result["documents"], result["metadatas"])
               if query in m.get("case_title", "") or query in doc]
    if not matches:
        print(f"'{query}' 와 일치하는 사례가 없습니다.")
        return
    for doc, m in matches:
        print(f"\n{'='*60}")
        print(f"사례 제목  : {m.get('case_title')}")
        print(f"사례 번호  : {m.get('case_number')}  |  연령: {m.get('age')}")
        print(f"영역       : {m.get('domain')}  |  출처: {m.get('source')}")
        print(f"페이지     : {m.get('page_start')} ~ {m.get('page_end')}")
        print(f"{'='*60}")
        print(doc)


def show_all_parent_action(collection):
    result = collection.get(include=["documents", "metadatas"])
    for doc, m in zip(result["documents"], result["metadatas"]):
        print(f"\n{'='*60}")
        print(f"[{m.get('case_title')}] (사례 {m.get('case_number')} / {m.get('domain')})")
        print(f"{'='*60}")
        print(doc)


# ── first_aid 출력 ──────────────────────────────────────────────────────────

def show_list_first_aid(collection):
    result = collection.get(include=["documents", "metadatas"])
    docs, metas = result["documents"], result["metadatas"]
    print(f"\n[first_aid] 총 {len(docs)}개 청크\n")
    print(f"{'#':<4} {'카테고리':<20} {'소분류':<25} {'미리보기'}")
    print("-" * 100)
    for i, (doc, m) in enumerate(zip(docs, metas), 1):
        preview = doc.replace("\n", " ")[:50]
        print(f"{i:<4} {m.get('category',''):<20} {m.get('subcategory',''):<25} {preview}")


def show_query_first_aid(collection, query: str):
    result = collection.get(include=["documents", "metadatas"])
    matches = [(doc, m) for doc, m in zip(result["documents"], result["metadatas"])
               if query in m.get("category", "") or query in m.get("subcategory", "") or query in doc]
    if not matches:
        print(f"'{query}' 와 일치하는 항목이 없습니다.")
        return
    for doc, m in matches:
        print(f"\n{'='*60}")
        print(f"카테고리   : {m.get('category')}")
        print(f"소분류     : {m.get('subcategory')}")
        print(f"제목       : {m.get('title')}  |  출처: {m.get('source')}")
        print(f"{'='*60}")
        print(doc)


def show_all_first_aid(collection):
    result = collection.get(include=["documents", "metadatas"])
    for doc, m in zip(result["documents"], result["metadatas"]):
        print(f"\n{'='*60}")
        print(f"[{m.get('category')}] {m.get('subcategory') or ''}")
        print(f"{'='*60}")
        print(doc)


# ── 진입점 ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import warnings
    warnings.filterwarnings("ignore")
    sys.stdout.reconfigure(encoding="utf-8")

    args = sys.argv[1:]

    # --collection 파싱
    collection_name = "parent_policy"
    if "--collection" in args:
        idx = args.index("--collection")
        collection_name = args[idx + 1]
        args = args[:idx] + args[idx + 2:]

    # 나머지 인자
    show_all = "--all" in args
    query = next((a for a in args if not a.startswith("--")), None)

    col = load_collection(collection_name)

    if collection_name == "parent_policy":
        if show_all:
            show_all_policy(col)
        elif query:
            show_query_policy(col, query)
        else:
            show_list_policy(col)
    elif collection_name == "child_guide":
        if show_all:
            show_all_child(col)
        elif query:
            show_query_child(col, query)
        else:
            show_list_child(col)
    elif collection_name == "parent_action":
        if show_all:
            show_all_parent_action(col)
        elif query:
            show_query_parent_action(col, query)
        else:
            show_list_parent_action(col)
    elif collection_name == "first_aid":
        if show_all:
            show_all_first_aid(col)
        elif query:
            show_query_first_aid(col, query)
        else:
            show_list_first_aid(col)
    else:
        print(f"알 수 없는 컬렉션: {collection_name}")
        print("사용 가능한 컬렉션: parent_policy, child_guide, parent_action, first_aid")
