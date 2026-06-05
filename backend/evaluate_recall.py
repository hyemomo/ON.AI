"""
Recall@k 평가 스크립트 - 골드 쿼리셋 기반 검색 정확도
Oracle ID는 JSON 파일을 직접 확인하여 수동으로 정확하게 맵핑.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import chromadb
from chromadb.utils import embedding_functions
from config import CHROMA_DIR, EMBEDDING_MODEL


# ── 골드 쿼리셋 ───────────────────────────────────────────────────────────────
GOLD_QUERIES = {
    "policy": [
        (
            "건강보험가입자가 임신과 출산 과정에서 드는 진료비를 지원받으려면 어떻게 해야 하나요?",
            "임신·출산이 확인된 건강보험가입자는 국민행복카드로 임신 1회당 100만원의 진료비와 약제 구입비를 지원받을 수 있습니다."
        ),
        (
            "한부모가족이 아동양육비 지원을 받으려면 어떤 조건을 충족해야 하나요?",
            "소득인정액이 기준중위소득 65% 이하이면서 18세 미만 자녀를 양육하는 한부모가족은 월 23만원의 아동양육비를 지원받을 수 있습니다."
        ),
        (
            "0~1세 영아를 양육하는 부모가 받을 수 있는 직접적인 금전 지원은 무엇인가요?",
            "0세 아동은 월 100만원, 1세는 월 50만원의 부모급여를 현금으로 받을 수 있습니다. 어린이집 이용 시 보육료로 대체됩니다."
        ),
        (
            "어린이집을 이용하는 영유아의 보육료는 누구나 지원받을 수 있나요?",
            "어린이집을 이용하는 0~5세 아동은 소득수준에 관계없이 국민행복카드로 보육료를 지원받습니다."
        ),
        (
            "미숙아 입원 치료비는 어떻게 지원되나요?",
            "출생 후 24시간 내 신생아집중치료실에 입원한 미숙아는 소득과 무관하게 입원치료비의 건강보험 급여 중 전액본인부담금 및 비급여 진료비를 지원받습니다."
        ),
        (
            "기저귀와 분유 구매비용을 지원받으려면 어떤 가정이 대상인가요?",
            "2세 미만 영아를 둔 기초생활보장 수급가정, 차상위계층, 한부모가족 수급가정은 기저귀 월 9만원, 조제분유 월 11만원을 국민행복카드 바우처로 지원받습니다."
        ),
        (
            "어린이집을 다니지 않고 집에서 아이를 키우는 부모가 받을 수 있는 지원은 무엇인가요?",
            "24개월 이상~86개월 미만으로 어린이집·유치원을 이용하지 않는 가정양육 아동의 보호자는 월 10만원의 양육수당을 현금으로 지급받습니다."
        ),
        (
            "아동수당은 어떤 연령까지 지원받을 수 있나요?",
            "0~8세 미만의 모든 아동은 소득기준 없이 월 10만원의 아동수당을 8세 생일이 속하는 달의 전 달까지 지급받을 수 있습니다."
        ),
        (
            "한부모가족이 받을 수 있는 주거 지원에는 어떤 것이 있나요?",
            "한부모가족은 매입임대주택 및 공동생활가정 입주 지원을 받을 수 있으며, 소득 기준을 충족하는 경우 우선 입주 자격이 주어집니다."
        ),
        (
            "한부모가족이 취업을 위해 받을 수 있는 훈련 지원은 무엇인가요?",
            "한부모가족은 직업훈련 프로그램 참여 시 훈련비 지원 및 취업 연계 서비스를 받을 수 있으며, 교육취업 카테고리 정책을 통해 신청할 수 있습니다."
        ),
    ],
    "parenting": [
        (
            "11개월 아기가 이유식을 입에 넣어주어도 뱉어내고 잘 먹지 않으면 어떻게 해야 하나요?",
            "하루 총 섭취량을 확인하고, 아기가 식욕을 가장 잘 느끼는 시간에 이유식을 제공해야 합니다. 즐거운 분위기에서 다양한 메뉴로 긍정적인 식사 경험을 만들어주어야 합니다."
        ),
        (
            "3세 아이가 채소를 전혀 먹지 않고 편식이 심할 때 어떻게 지도해야 하나요?",
            "절대 억지로 먹이지 말고, 부모가 골고루 먹는 모습을 보여주어야 합니다. 아이를 요리에 참여시키고, 같은 재료로 다양한 음식을 제공하는 푸드브릿지 기법을 활용하세요."
        ),
        (
            "2세 아이가 식탁에 앉아서 밥을 먹지 않고 이리저리 돌아다니면 어떻게 해야 하나요?",
            "식사시간과 놀이시간을 명확히 구분하고 TV를 끄며, 아이가 직접 음식을 떠먹을 수 있도록 해주세요. 부모와 함께 즐거운 대화를 나누며 식사하는 분위기를 만들어야 합니다."
        ),
        (
            "만 1세 아이가 친구를 자꾸 물어요. 어떻게 대처해야 하나요?",
            "먼저 아이의 마음을 읽어주고, 단호하게 무는 행동은 안 된다고 알려주어야 합니다. 치아발육기 등 물어도 되는 것을 주어 욕구를 수용하고, 나-전달법으로 자신을 표현하는 연습을 시켜주세요."
        ),
        (
            "아이가 교사를 밀치고 거부할 때 어떻게 대응해야 하나요?",
            "아이의 감정을 먼저 읽어주고 도와주려는 마음을 전달해야 합니다. 단호하게 때리는 행동은 안 된다고 알려주되, 아이가 무섭지 않게 부드럽게 전달하고 적절한 다른 방법을 제시해주세요."
        ),
        (
            "만 2세 아이가 친구를 할퀴는 행동을 반복할 때 어떻게 지도해야 하나요?",
            "영아의 마음을 충분히 수용하되, 할퀴기는 안 된다는 행동 기준을 분명히 알려주어야 합니다. 반복될 경우 제지를 먼저 한 뒤 감정을 읽어주는 순서로 바꾸어야 합니다."
        ),
        (
            "아이가 물건을 자꾸 던지는 행동을 할 때 어떻게 대처해야 하나요?",
            "던지는 것이 재미있는 아이의 마음을 읽어주되, 단호하게 물건을 던지면 안 된다는 기준을 알려주어야 합니다. 콩주머니 던지기 등 안전한 던지기 놀이 기회를 제공하세요."
        ),
        (
            "3세 6개월 아이가 아직 배변을 가리지 못하면 어떻게 해야 하나요?",
            "부모는 여유로운 마음으로 배변 실수를 야단치지 말고 다독여야 합니다. 규칙적으로 화장실에 가도록 지도하고, 성공했을 때 충분히 칭찬하며 화장실을 친근하게 느낄 수 있도록 해주세요."
        ),
        (
            "아이가 등원할 때 엄마와 헤어지기 싫어하며 분리불안을 보일 때 어떻게 해야 하나요?",
            "일정한 등원 순서를 통해 예측 가능한 상황을 만들어 주어야 합니다. 충분한 스킨십으로 애정을 확인하고, 어린이집 생활을 격려하는 인사를 나눈 뒤 교사에게 맡기도록 합니다."
        ),
        (
            "아이가 떼를 너무 심하게 쓸 때 어떻게 대처해야 하나요?",
            "아이의 감정을 먼저 읽어주고 공감한 뒤, 해줄 수 없는 것은 단호하게 전달해야 합니다. 일관된 양육 태도를 유지하는 것이 중요하며, 떼쓰기로 원하는 것을 얻는 경험을 반복시키지 않아야 합니다."
        ),
    ],
    "first_aid": [
        (
            "아이가 끓는 물에 화상을 입었을 때 초기 응급처치는 어떻게 해야 하나요?",
            "흐르는 수돗물이나 얼음물에 최소 15~30분 이상 충분히 식혀야 합니다. 옷을 입은 채 데었다면 찬물을 끼얹어 식힌 후 벗겨야 하며, 민간요법(간장, 된장 등)은 사용하지 말아야 합니다."
        ),
        (
            "아이 코피가 멈추지 않을 때 어떻게 지혈해야 하나요?",
            "출혈하는 쪽 코를 고개를 숙인 채 5분 정도 압박하고, 이마부터 코에 걸쳐 젖은 수건으로 식혀야 합니다. 30분 이상 멈추지 않으면 이비인후과를 방문해야 합니다."
        ),
        (
            "아이가 머리를 바닥에 세게 부딪혔을 때 심각한 증상은 무엇인가요?",
            "전혀 울지 않고 의식이 없거나, 귀나 코에서 출혈, 구토, 경련, 두통이 있으면 즉시 구급차를 불러 뇌신경 외과로 가야 합니다. 의식 불명이면 옆으로 눕혀 기도를 확보해야 합니다."
        ),
        (
            "아이가 사탕이나 동전을 삼켜 목에 걸렸을 때 어떻게 해야 하나요?",
            "아기를 거꾸로 하여 등을 때리거나 하임리히법(복부를 후상방으로 강하게 압박)을 사용해야 합니다. 여러 번 시도해도 나오지 않으면 즉시 병원으로 가야 합니다."
        ),
        (
            "아이의 귀에 이물질(구슬이나 콩 등)이 들어갔을 때 어떻게 해야 하나요?",
            "집에서 무리하게 빼려다 더 안으로 들어갈 수 있으므로 재빨리 이비인후과에 가야 합니다. 귀에 벌레가 들어간 경우는 어두운 방에서 빛을 대거나 올리브유를 떨어뜨려 볼 수 있습니다."
        ),
        (
            "아이가 세제나 약물을 삼켰을 때 응급처치의 핵심 원칙은 무엇인가요?",
            "무조건 토하게 해서는 안 됩니다. 무엇을 얼마나 언제 먹었는지 정확히 파악하고, 용기와 설명서를 가지고 즉시 병원에 가야 합니다."
        ),
        (
            "아이가 관절을 삐어 팔꿈치가 빠진 것 같을 때 어떻게 해야 하나요?",
            "탈구가 의심될 경우 함부로 맞추려 하지 말고 즉시 병원에 가야 합니다. 이동 중에는 부목으로 고정하여 움직이지 않도록 해야 합니다."
        ),
        (
            "아이가 벌레에 물리거나 벌에 쏘였을 때 응급처치는 어떻게 하나요?",
            "벌침이 있으면 신용카드나 손톱으로 밀어서 제거하고, 해당 부위를 차게 해주어야 합니다. 호흡곤란이나 심한 알레르기 반응이 나타나면 즉시 119에 연락해야 합니다."
        ),
        (
            "아이가 열이 나면서 경련을 일으킬 때 응급처치는 무엇인가요?",
            "옷을 벗기고 미지근한 물수건으로 전신을 닦아 해열시켜야 합니다. 아이를 옆으로 눕혀 타액이 흘러나오게 하고, 입을 강제로 벌리거나 흔들지 말아야 합니다. 경련이 15분 이상 지속되면 즉시 병원에 가야 합니다."
        ),
        (
            "더운 날 차 안에 방치된 아이가 쓰러졌을 때 어떻게 해야 하나요?",
            "즉시 시원한 곳으로 옮기고 옷을 느슨하게 풀어주어야 합니다. 차가운 물수건으로 몸을 식히고, 의식이 있으면 차가운 음료를 조금씩 먹이되, 의식이 없으면 즉시 119에 연락해야 합니다."
        ),
    ],
}


# ── 수동 Oracle 맵 (JSON 파일 직접 확인으로 검증) ──────────────────────────────
#
# 맵핑 기준:
#   first_aid  : first_aid_chunks.json  (first_aid_000N -> chunk_(N-1))
#   parent_action: parent_action_cases.json (case_NN -> chunk_(NN-1))
#   child_guide  : child_action1_cases.json (0-indexed)
#   parent_policy: policies.json (0-indexed, 순서대로)
#
# 각 항목: (collection_name, chunk_id)  또는  [(col, id), ...] (복수 정답 허용)

# 각 쿼리별 유효 Oracle 목록. 하나라도 top-k 안에 있으면 hit.
# policy : 정책명이 1:1 매핑 → 단일 oracle
# parenting/first_aid : 유사 주제 청크 여러 개가 모두 정답 → 복수 oracle
ORACLE_MAP: dict[str, list[list[tuple[str, str]]]] = {
    "policy": [
        # 0. 임신출산 진료비 지원
        [("parent_policy", "chunk_0")],
        # 1. 아동양육비
        [("parent_policy", "chunk_8")],
        # 2. 0~1세 영아 금전 지원 (부모급여)
        [("parent_policy", "chunk_23")],
        # 3. 보육료 지원
        [("parent_policy", "chunk_20")],
        # 4. 미숙아 치료비
        [("parent_policy", "chunk_14")],
        # 5. 기저귀·분유
        [("parent_policy", "chunk_17")],
        # 6. 양육수당
        [("parent_policy", "chunk_21")],
        # 7. 아동수당
        [("parent_policy", "chunk_18")],
        # 8. 주거 지원 (복지시설 / 공동생활가정 / 공공주택 모두 유효)
        [("parent_policy", "chunk_33"),
         ("parent_policy", "chunk_34"),
         ("parent_policy", "chunk_35")],
        # 9. 취업훈련 지원 (국민취업지원제도 / 여성새로일하기센터 모두 유효)
        [("parent_policy", "chunk_43"),
         ("parent_policy", "chunk_38")],
    ],
    "parenting": [
        # 0. 이유식
        [("parent_action", "chunk_0")],
        # 1. 편식
        [("parent_action", "chunk_1")],
        # 2. 식탁에서 돌아다님
        [("parent_action", "chunk_2")],
        # 3. 친구를 무는 행동
        [("child_guide", "chunk_0")],
        # 4. 교사를 밀치고 거부 (밀쳐내기 / 때리기 모두 유효)
        [("child_guide", "chunk_1"),
         ("child_guide", "chunk_8")],
        # 5. 친구를 할퀴는 행동 (할퀴기 / 무는 행동 유사)
        [("child_guide", "chunk_2"),
         ("child_guide", "chunk_0")],
        # 6. 물건을 던지는 행동
        [("child_guide", "chunk_3")],
        # 7. 배변 가리지 못함
        [("parent_action", "chunk_3")],
        # 8. 등원 시 분리불안 (어려서 헤어지기 어려움 / 양육자와 헤어짐 힘든 경우)
        [("child_guide", "chunk_28"),
         ("child_guide", "chunk_26")],
        # 9. 떼쓰기 (떼쓰는 경우 / 짜증내는 경우 / 화 참을 수 없는 경우)
        [("child_guide", "chunk_11"),
         ("child_guide", "chunk_5"),
         ("child_guide", "chunk_33")],
    ],
    "first_aid": [
        # 0. 화상 (가벼운 / 심한 둘 다 유효)
        [("first_aid", "chunk_0"),
         ("first_aid", "chunk_1")],
        # 1. 코피
        [("first_aid", "chunk_5")],
        # 2. 머리 부딪혔을 때 심각한 증상
        [("first_aid", "chunk_4")],
        # 3. 사탕/동전 목에 걸림
        [("first_aid", "chunk_10")],
        # 4. 귀에 구슬/콩
        [("first_aid", "chunk_15")],
        # 5. 세제/약물 삼킴
        [("first_aid", "chunk_17")],
        # 6. 팔꿈치 탈구
        [("first_aid", "chunk_27")],
        # 7. 벌에 쏘임
        [("first_aid", "chunk_34")],
        # 8. 열성 경련 (열성 경련 / 열사병 유사 증상)
        [("first_aid", "chunk_36"),
         ("first_aid", "chunk_35")],
        # 9. 열사병·차 안 방치 (열사병 / 열성 경련 유사 증상)
        [("first_aid", "chunk_35"),
         ("first_aid", "chunk_36")],
    ],
}


# ── ChromaDB 설정 ─────────────────────────────────────────────────────────────
_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
_client = chromadb.PersistentClient(path=CHROMA_DIR)

MODE_COLLECTIONS = {
    "policy":    ["parent_policy"],
    "parenting": ["parent_action", "child_guide"],
    "first_aid": ["first_aid"],
}


def _search_collection_with_dist(col_name: str, query_text: str, n: int) -> list[tuple[str, str, float]]:
    """ChromaDB 컬렉션 검색, (col_name, doc_id, distance) 리스트 반환."""
    col = _client.get_collection(name=col_name, embedding_function=_ef)
    count = col.count()
    if count == 0:
        return []
    res = col.query(
        query_texts=[query_text],
        n_results=min(n, count),
        include=["distances"],
    )
    return [(col_name, doc_id, dist)
            for doc_id, dist in zip(res["ids"][0], res["distances"][0])]


def _search_top_k(collections: list[str], query_text: str, n: int) -> list[tuple[str, str]]:
    """여러 컬렉션을 검색 후 거리 기준으로 정렬, 상위 n개 (col_name, doc_id) 반환."""
    all_results: list[tuple[str, str, float]] = []
    for col_name in collections:
        all_results += _search_collection_with_dist(col_name, query_text, n)
    all_results.sort(key=lambda x: x[2])
    return [(col, doc_id) for col, doc_id, _ in all_results[:n]]


def _recall_at_k(oracles: list[tuple[str, str]], retrieved: list[tuple[str, str]], k: int) -> int:
    """유효 oracle 중 하나라도 top-k 안에 있으면 1, 아니면 0."""
    top = set(retrieved[:k])
    return 1 if any(o in top for o in oracles) else 0


# ── 평가 실행 ─────────────────────────────────────────────────────────────────

def run_recall_evaluation():
    K_LIST = [1, 3, 5, 7]
    N_RETRIEVE = 7

    print("\n" + "=" * 70)
    print("  Recall@k 평가 - 골드 쿼리셋 기반 검색 정확도 (수동 Oracle 맵핑)")
    print("=" * 70)

    summary = []

    for mode, queries in GOLD_QUERIES.items():
        collections = MODE_COLLECTIONS[mode]
        oracles = ORACLE_MAP[mode]

        print(f"\n[{mode.upper()} 모드]  쿼리 {len(queries)}개")
        print(f"  {'질문':42}  {'Oracle (대표)':22}  " +
              "  ".join(f"R@{k}" for k in K_LIST))
        print("  " + "-" * 82)

        hits = {k: 0 for k in K_LIST}
        valid = 0

        for idx, (question, _) in enumerate(queries):
            oracle_list = oracles[idx]  # list[tuple[str, str]]

            retrieved = _search_top_k(collections, question, N_RETRIEVE)

            r = {k: _recall_at_k(oracle_list, retrieved, k) for k in K_LIST}
            for k in K_LIST:
                hits[k] += r[k]
            valid += 1

            mark = "  ".join(f"{'O' if r[k] else 'X'}" for k in K_LIST)
            # 대표 oracle: 첫 번째 항목, 복수인 경우 "+N" 표시
            rep = oracle_list[0]
            suffix = f"+{len(oracle_list)-1}" if len(oracle_list) > 1 else "  "
            oracle_short = f"{rep[0][-10:]}:{rep[1]}{suffix}"
            print(f"  {question[:40]:42}  {oracle_short:22}  {mark}")

        if valid == 0:
            continue

        print("  " + "-" * 78)
        avg = {k: hits[k] / valid for k in K_LIST}
        avg_str = "  ".join(f"{avg[k]:.1%}" for k in K_LIST)
        print(f"  {'평균 Recall':42}  {'':20}  {avg_str}")

        summary.append((mode, avg))

    # ── 전체 요약 ─────────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  전체 모드 평균 요약")
    print("  " + "-" * 45)
    print(f"  {'모드':12}" + "  ".join(f"  R@{k}" for k in K_LIST))
    print("  " + "-" * 45)

    total_avg = {k: 0.0 for k in K_LIST}
    for mode, avg in summary:
        row = "  ".join(f"{avg[k]:6.1%}" for k in K_LIST)
        print(f"  {mode:12}  {row}")
        for k in K_LIST:
            total_avg[k] += avg[k]

    if summary:
        n_modes = len(summary)
        row = "  ".join(f"{total_avg[k]/n_modes:6.1%}" for k in K_LIST)
        print("  " + "-" * 45)
        print(f"  {'전체 평균':12}  {row}")

    print("=" * 70)


if __name__ == "__main__":
    run_recall_evaluation()
