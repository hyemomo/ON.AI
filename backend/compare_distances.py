"""
쿼리 재작성 전/후 ChromaDB 검색 거리 비교 스크립트

실행 방법:
  cd backend
  python compare_distances.py

출력:
  - 각 쿼리별 재작성 전/후 top3 평균 거리
  - 모드별 평균 개선율
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import os
import chromadb
from chromadb.utils import embedding_functions
from config import CHROMA_DIR, EMBEDDING_MODEL, GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CLOUD_PROJECT

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

from google import genai as google_genai
from google.genai import types as genai_types

# rag.py의 _gemini_model을 Vertex AI로 패치
_vertex_client = google_genai.Client(vertexai=True, project=GOOGLE_CLOUD_PROJECT, location="us-central1")

class _VertexModelPatch:
    def __init__(self, system: str):
        self.system = system

    def generate_content(self, prompt: str):
        return _vertex_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=genai_types.GenerateContentConfig(system_instruction=self.system),
        )

import services.rag as rag_module
rag_module._gemini_model = lambda system: _VertexModelPatch(system)

from services.rag import classify_and_rewrite, ChatState

# ── 골드셋 쿼리 ───────────────────────────────────────────────────────────────

GOLD_QUERIES = {
    "policy": [
        "아동양육비 지원 대상과 금액이 어떻게 되나요?",
        "한부모가족 매입임대주택 신청 방법을 알고 싶어요",
        "아동수당 신청하는 방법을 알려주세요",
        "한부모가족 취업 훈련 지원이 있나요?",
        "전기요금 수도요금 감면 혜택을 받을 수 있나요?",
        "자녀 교육비 지원을 받고 싶어요",
        "양육비 이행 지원 서비스는 무엇인가요?",
        "한부모가족 의료급여 지원을 받을 수 있나요?",
        "공동생활가정에 입주하고 싶어요",
        "아이돌봄 서비스 신청 방법이 궁금해요",
    ],
    "parenting": [
        "아이가 친구를 자꾸 물어요",
        "아이가 이유식을 먹지 않으려고 해요",
        "아이가 편식이 너무 심해요",
        "아이가 밥 먹을 때 돌아다녀요",
        "아이가 친구를 때리고 할퀴어요",
        "아이가 물건을 자꾸 던져요",
        "분리불안이 심해서 어린이집을 못 가요",
        "아이가 배변을 가리지 못해요",
        "아이가 떼를 너무 많이 써요",
        "아이가 등원할 때 엄마와 헤어지기 싫어해요",
    ],
    "first_aid": [
        "아이가 화상을 입었어요 어떻게 해야 하나요?",
        "아이 코피가 멈추지 않아요",
        "아이가 머리를 세게 부딪혔어요",
        "아이가 동전을 삼킨 것 같아요",
        "아이 팔꿈치가 빠진 것 같아요",
        "아이가 벌에 쏘였어요",
        "아이가 세제를 먹었어요",
        "아이 눈에 이물질이 들어갔어요",
        "아이가 열이 나면서 경련을 해요",
        "아이가 더운 날 차 안에 있다가 쓰러졌어요",
    ],
}

MODE_COLLECTIONS = {
    "policy":    ["parent_policy"],
    "parenting": ["parent_action", "child_guide"],
    "first_aid": ["first_aid"],
}

TOP_K = 3

# ── ChromaDB 직접 검색 ─────────────────────────────────────────────────────────

def search_distance(query: str, collections: list[str]) -> float:
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    distances = []
    for col_name in collections:
        try:
            col = client.get_collection(name=col_name, embedding_function=ef)
            res = col.query(query_texts=[query], n_results=TOP_K)
            distances.extend(res["distances"][0])
        except Exception:
            pass
    if not distances:
        return 1.0
    return sum(sorted(distances)[:TOP_K]) / min(len(distances), TOP_K)


def get_rewritten_query(query: str, mode: str) -> str:
    initial: ChatState = {
        "query": query,
        "search_query": query,
        "history": [],
        "mode": mode,
        "category": "",
        "policy_category": "",
        "user_context": "",
        "collections": [],
        "context": "",
        "sources": [],
        "reply": "",
        "is_fallback": False,
    }
    state = classify_and_rewrite(initial)
    return state["search_query"]


# ── 비교 실행 ─────────────────────────────────────────────────────────────────

def run_comparison():
    print("\n" + "="*72)
    print("  쿼리 재작성 전/후 검색 거리 비교 (top3 평균)")
    print("="*72)

    all_before, all_after = [], []

    for mode, queries in GOLD_QUERIES.items():
        cols = MODE_COLLECTIONS[mode]
        print(f"\n[{mode.upper()} 모드]")
        print(f"  {'쿼리':<38} {'재작성 전':>9} {'재작성 후':>9} {'개선율':>8}")
        print("  " + "-"*68)

        mode_before, mode_after = [], []

        for query in queries:
            rewritten = get_rewritten_query(query, mode)
            dist_before = search_distance(query, cols)
            dist_after  = search_distance(rewritten, cols) if rewritten else dist_before
            improvement = (dist_before - dist_after) / dist_before * 100 if dist_before > 0 else 0

            q = query[:36]
            print(f"  {q:<38} {dist_before:>9.4f} {dist_after:>9.4f} {improvement:>+7.1f}%")

            mode_before.append(dist_before)
            mode_after.append(dist_after)

        avg_b = sum(mode_before) / len(mode_before)
        avg_a = sum(mode_after)  / len(mode_after)
        avg_imp = (avg_b - avg_a) / avg_b * 100

        print("  " + "-"*68)
        print(f"  {'모드 평균':<38} {avg_b:>9.4f} {avg_a:>9.4f} {avg_imp:>+7.1f}%")

        all_before.extend(mode_before)
        all_after.extend(mode_after)

    total_b = sum(all_before) / len(all_before)
    total_a = sum(all_after)  / len(all_after)
    total_imp = (total_b - total_a) / total_b * 100

    print("\n" + "="*72)
    print("  전체 요약")
    print("="*72)
    print(f"  {'항목':<38} {'재작성 전':>9} {'재작성 후':>9} {'개선율':>8}")
    print("  " + "-"*68)
    print(f"  {'전체 평균 검색 거리':<38} {total_b:>9.4f} {total_a:>9.4f} {total_imp:>+7.1f}%")
    print("="*72 + "\n")


if __name__ == "__main__":
    run_comparison()
