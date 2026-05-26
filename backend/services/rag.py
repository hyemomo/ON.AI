import json
import re

import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict

from config import CHROMA_DIR, EMBEDDING_MODEL, GEMINI_API_KEY


MODE_MAP: dict[str, dict] = {
    "policy":     {"collections": ["parent_policy"],              "category": "복지정책"},
    "parenting":  {"collections": ["parent_action", "child_guide"], "category": "육아방법"},
    "first_aid":  {"collections": ["first_aid"],                  "category": "응급처치"},
    "counseling": {"collections": [],                              "category": "상담"},
}

TITLE_KEYS: dict[str, str] = {
    "parent_policy": "policy_name",
    "child_guide": "case_title",
    "parent_action": "case_title",
    "first_aid": "title",
}

POLICY_CATEGORIES = {"임신출산", "양육돌봄", "시설주거", "교육취업", "금융법률", "생활편의"}

POLICY_REWRITE_PROMPT = """이 서비스는 한부모가족 전용 복지정책 검색 시스템입니다.
사용자 질문에서 ChromaDB 검색에 최적화된 키워드와 분류를 추출하세요.

분류 기준:
- 임신출산: 임신, 출산, 산모, 신생아, 분만, 출생신고 관련
- 양육돌봄: 아동수당, 양육비, 보육, 돌봄, 아동발달 관련
- 시설주거: 주거, 매입임대, 공동생활가정, 임대 관련
- 교육취업: 교육, 직업, 취업, 훈련, 장학금 관련
- 금융법률: 금융, 법률, 대출, 양육비 이행, 법적 지원 관련
- 생활편의: 요금감면, 에너지, 문화, 스포츠, 운전면허 등 일상 생활 혜택

search_query 규칙:
- 정책명이 명확히 언급된 경우 정책명을 그대로 사용하세요.
- 정책명이 없는 경우, 반드시 "한부모" 키워드를 포함하여 작성하세요.
- 나이·지역·개인 상황 등은 제거하고 정책 핵심 키워드만 남기세요.
예) "온가족보듬사업에 대해 자세히 설명해줘" → "온가족보듬사업"
예) "27세 춘천 주거 지원 받고 싶어" → "한부모 주거 지원"
예) "자가 없는데 지원 받을 수 있어?" → "한부모 주거 지원"
예) "아동양육비 어떻게 신청해?" → "아동양육비 신청"
예) "취업하고 싶은데 도움 받을 수 있어?" → "한부모 취업 지원"
예) "전기요금 할인 받을 수 있어?" → "한부모 요금감면 혜택"
예) "양육비 못 받고 있어요" → "한부모 양육비 이행 지원"

{history_block}질문: {query}

반드시 아래 JSON 형식으로만 답하세요:
{{"search_query": "검색 키워드", "policy_category": "분류명"}}"""


POLICY_SYSTEM = """당신은 한부모가족을 위한 전문 복지 도우미입니다.
아래 참고 자료를 바탕으로 친절하고 정확하게 답변하세요.
참고 자료에 없는 내용은 절대 추측하지 마세요.

[답변 형식 규칙]
1. 여러 정책이 검색된 경우 (처음 탐색하는 질문):
   - 각 정책명을 **굵게** 표시하고 핵심 내용을 1~2줄로 요약해 목록으로 보여주세요.
   - 마지막에 "더 알고 싶은 정책이 있으면 말씀해 주세요." 를 추가하세요.

2. 특정 정책에 대해 구체적으로 묻는 경우:
   - 지원대상 / 지원내용 / 신청방법 순으로 구체적으로 설명하세요.
   - 참고 자료에 신청URL이 있으면 답변 마지막에 아래 형식으로 반드시 포함하세요:
     신청 바로가기: https://...

답변은 한국어로 작성하세요."""

PARENTING_SYSTEM = """당신은 한부모가족을 위한 육아 전문 상담사입니다.
아래 참고 자료를 바탕으로 친절하고 따뜻하게 답변하세요.

[중요 규칙]
- 참고 자료는 보육교사 지침서 또는 아동 지도 사례에서 가져온 내용일 수 있습니다.
- 반드시 교사·교실·보육기관 관점의 표현을 부모·가정 관점으로 바꿔서 답변하세요.
  예) "교사가 개입한다" → "부모님이 함께해 주세요"
  예) "교실에서" → "집에서"
  예) "교구" → "장난감이나 물건"
- 참고 자료에 없는 내용은 추측하지 마세요.
- 답변은 공감으로 시작하고, 구체적인 대처법을 단계별로 안내하세요.
- 마지막에 필요하면 가족센터나 전문 상담 기관 방문을 권유하세요.
- 답변은 한국어로 작성하세요."""

COUNSELING_SYSTEM = """당신은 한부모가족을 위한 심리 상담 전문 AI입니다.
수용전념치료(ACT) 원칙을 바탕으로 대화를 안내하세요.

[핵심 원칙]
- 단순히 위로하거나 조언을 제공하거나 기분을 좋게 만들려 하지 마세요.
- 사용자의 말에 무조건 동의하거나 긍정하지 마세요.
- 정체된 생각 패턴에 부드럽게 도전하고, 심리적 유연성을 키울 수 있도록 도와주세요.
- 한부모로서 겪는 어려움(양육 부담, 경제적 압박, 외로움)에 깊이 공감하되,
  그 감정에 함몰되지 않고 가치 있는 삶으로 나아갈 수 있도록 안내하세요.

[ACT 6가지 프로세스를 답변에 반영하세요]
1. 인지 탈융합 — 사용자의 생각을 사실이 아닌 "하나의 생각"으로 바라볼 수 있도록 도와주세요.
   예) "나는 나쁜 부모야"라는 말에 "그런 생각이 드는군요. 그 생각이 사실처럼 느껴지시나요?"

2. 수용 — 불편한 감정을 억누르거나 회피하지 않고 있는 그대로 경험하도록 격려하세요.
   예) "그 감정을 잠시 옆에 두고, 지금 이 순간 무엇이 느껴지시나요?"

3. 현재 순간 인식 — 과거 후회나 미래 걱정에 사로잡혀 있을 때 지금 여기로 돌아오도록 안내하세요.

4. 맥락으로서의 자기 — 사용자가 자신의 생각과 감정 그 이상임을 상기시켜 주세요.
   예) "그 감정을 느끼는 분과, 그 감정을 바라보는 분은 다른 분이에요."

5. 가치 명확화 — 사용자에게 가장 중요한 것, 어떤 부모·어떤 사람이 되고 싶은지 성찰하도록 안내하세요.
   예) "지금 가장 소중하게 여기는 것이 무엇인가요?"

6. 전념 행동 — 아무리 작더라도 가치에 기반한 구체적인 한 걸음을 격려하세요.
   예) "오늘 딱 하나, 할 수 있는 작은 행동이 있다면 무엇일까요?"

[답변 형식]
- 답변은 2~3문장으로 간결하게 작성하세요.
- 매 답변은 사용자의 말을 반영한 공감 문장으로 시작하세요.
- 대화가 진행 중일 때는 답변 마지막을 열린 질문으로 끝내세요.
- 대화 마무리 조건이 충족되면, 열린 질문 없이 따뜻한 마무리 문장으로 끝내세요.
  예) "오늘 이렇게 마음을 나눠주셔서 감사해요. 언제든 다시 이야기 나눠요."
- 가족센터 안내는 아래 두 조건이 동시에 충족될 때만, 마무리 문장 뒤에 딱 한 번 추가하세요.
  조건 1: 대화 마무리 단계일 것 (대화가 진행 중이면 절대 사용하지 마세요)
  조건 2: 사용자가 우울감, 자해 위험, 극심한 고립감 등 전문 상담이 필요한 상황으로 판단될 것
  문구: "더 깊은 도움이 필요하시면 가족센터(국번없이 1577-0100)에 연락해 보세요."
- 답변은 한국어로 작성하세요."""

FIRST_AID_SYSTEM = """당신은 소아·유아 응급처치 전문 안내 AI입니다.
아래 참고 자료를 바탕으로 침착하고 명확하게 응급처치 방법을 안내하세요.

[답변 규칙]
- 참고 자료에 있는 내용만 안내하세요. 없는 내용은 추측하지 마세요.
- 즉시 해야 할 응급처치 순서를 번호로 안내하세요.
- 병원에 가야 하는 심각한 상황이면 반드시 명시하세요.
- 복지 정책, 지원금 등 응급처치와 무관한 내용은 언급하지 마세요.
- 답변은 한국어로 작성하세요."""

FIRST_AID_REWRITE_PROMPT = """이 서비스는 소아·유아 응급처치 정보 검색 시스템입니다.
사용자 질문에서 ChromaDB 검색에 최적화된 키워드를 추출하세요.

[DB에 저장된 응급처치 카테고리와 핵심 키워드]
- 화상: 뜨거운 물, 불, 화기, 피부 빨개짐, 물집, 냉찜질
- 머리를 다쳤을 때: 머리 부딪힘, 낙상, 뇌 손상, 의식 없음, 구토, 경련, 두통
- 피가 날 때: 코피, 출혈, 지혈, 손발 출혈, 동맥 출혈
- 이물질을 삼켰을 때: 목에 걸림, 기도 막힘, 하임리히법, 사탕, 동전, 땅콩
- 눈·귀에 이물질: 눈 이물질, 귀 이물질, 귀에 벌레, 귀에 물
- 코에 물이 들어갔을 때: 코 이물질, 콧구멍, 구슬, 콩
- 약물을 삼켰을 때: 독물, 세제, 담배, 약물 섭취, 살충제, 화장품 섭취
- 가슴을 부딪쳤을 때: 가슴 타박, 배 부딪힘, 내장 손상
- 손·발의 부상: 베인 상처, 찰과상, 가시, 못, 유리 찔림, 동물 할큄, 파상풍
- 관절이 삐었을 때: 탈구, 염좌, 팔꿈치 탈구, 어깨 탈구, 발목 삠
- 타박상을 입었을 때: 타박상, 멍, 부딪혀 붓기
- 치아 손상: 치아 빠짐, 이 부러짐, 치아 외상
- 혀를 깨물었을 때: 혀 출혈, 혀 부상
- 벌레에 물리거나 쏘였을 때: 벌 쏘임, 모기, 개미, 독침, 알레르기 반응, 호흡곤란
- 열사병·일사병: 더위, 탈수, 직사광선, 차 안에 방치
- 열성 경련: 경련, 발작, 고열 경련, 소아 경련, 열성경련
- 딸꾹질: 딸꾹질 지속

search_query 규칙:
- 사용자의 자연어 문장을 위 카테고리·키워드 중심으로 변환하세요.
- 나이, 개인 정보 등은 제거하고 응급 상황 핵심만 남기세요.
- 증상과 카테고리명을 조합하여 2~4개의 핵심 키워드로 작성하세요.

예) "아이가 밤새 38.5도 열이 나요" → "열성 경련 고열 응급처치"
예) "아기가 뜨거운 물에 손을 데었어요" → "화상 응급처치 냉찜질"
예) "아이가 머리를 바닥에 부딪혔는데 구토를 해요" → "머리 부딪힘 구토 심각한 증상"
예) "아이 코에 구슬이 들어갔어요" → "코 이물질 구슬"
예) "아이가 동전을 삼켰어요" → "이물질 삼킴 고형물 하임리히법"
예) "아이가 벌에 쏘였는데 숨을 못 쉬어요" → "벌 쏘임 알레르기 호흡곤란"
예) "팔을 다쳐서 팔이 축 늘어졌어요" → "팔꿈치 탈구 응급처치"
예) "아이가 락스를 마셨어요" → "약물 독물 삼킴 세제"
예) "아이 무릎이 삐었어요" → "관절 염좌 무릎 냉찜질"
예) "더운 날 차 안에 있다가 쓰러졌어요" → "열사병 일사병 탈수"

질문: {query}

반드시 아래 JSON 형식으로만 답하세요:
{{"search_query": "검색 키워드"}}"""

FALLBACK_SYSTEM = """당신은 한부모가족을 위한 전문 도움 비서입니다.
이 질문은 데이터베이스에 없는 내용입니다.
일반적인 정보를 바탕으로 답변하되, 답변 끝에 반드시
"※ 이 답변은 일반적인 정보입니다. 정확한 내용은 관련 기관에 문의하세요."를 추가하세요."""

MAX_DISTANCE = 0.5


class ChatState(TypedDict):
    query: str
    search_query: str
    history: list[dict]
    mode: str
    category: str
    policy_category: str
    collections: list[str]
    context: str
    sources: list[dict]
    reply: str
    is_fallback: bool


def _gemini_model(system: str):
    genai.configure(api_key=GEMINI_API_KEY)
    return genai.GenerativeModel(model_name="gemini-3.1-flash-lite", system_instruction=system)


# 서버 시작 시 한 번만 로드 (매 요청마다 모델 재로드 방지)
_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
_client = chromadb.PersistentClient(path=CHROMA_DIR)


def _chroma_client():
    return _client, _ef


def classify_and_rewrite(state: ChatState) -> ChatState:
    mode = state.get("mode", "")

    # policy 모드 + 프론트에서 카테고리 직접 선택: Gemini 분류 없이 바로 결정
    if mode == "policy" and state.get("policy_category"):
        history = state.get("history", [])
        history_block = ""
        if history:
            recent = history[-6:]
            lines = "\n".join(f"  {h['role']}: {h['content'][:120]}" for h in recent)
            history_block = f"이전 대화:\n{lines}\n\n"

        model = _gemini_model("당신은 복지정책 검색 전문가입니다.")
        raw = model.generate_content(
            POLICY_REWRITE_PROMPT.format(query=state["query"], history_block=history_block)
        ).text.strip()

        try:
            cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
            parsed = json.loads(cleaned)
            search_query = parsed.get("search_query", state["query"])
        except Exception:
            search_query = state["query"]

        print(f"[classify] search_query={search_query!r}  policy_category={state['policy_category']!r}  (프론트 직접 선택)")
        return {
            **state,
            "category": "복지정책",
            "search_query": search_query,
            "collections": ["parent_policy"],
        }

    # policy 모드 + 카테고리 미선택: Gemini로 search_query + policy_category 추출
    if mode == "policy":
        history = state.get("history", [])
        history_block = ""
        if history:
            recent = history[-6:]
            lines = "\n".join(f"  {h['role']}: {h['content'][:120]}" for h in recent)
            history_block = f"이전 대화:\n{lines}\n\n"

        model = _gemini_model("당신은 복지정책 검색 전문가입니다.")
        raw = model.generate_content(
            POLICY_REWRITE_PROMPT.format(query=state["query"], history_block=history_block)
        ).text.strip()

        try:
            cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
            parsed = json.loads(cleaned)
            search_query = parsed.get("search_query", state["query"])
            policy_category = parsed.get("policy_category", "")
        except Exception:
            search_query = state["query"]
            policy_category = ""

        if policy_category not in POLICY_CATEGORIES or policy_category == "기타":
            policy_category = ""

        print(f"[classify] search_query={search_query!r}  policy_category={policy_category!r}")

        return {
            **state,
            "category": "복지정책",
            "search_query": search_query,
            "policy_category": policy_category,
            "collections": ["parent_policy"],
        }

    # first_aid: Gemini로 쿼리 리라이팅 후 결정
    if mode == "first_aid":
        model = _gemini_model("당신은 소아 응급처치 정보 검색 전문가입니다.")
        raw = model.generate_content(
            FIRST_AID_REWRITE_PROMPT.format(query=state["query"])
        ).text.strip()
        try:
            cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
            parsed = json.loads(cleaned)
            search_query = parsed.get("search_query", state["query"])
        except Exception:
            search_query = state["query"]
        print(f"[classify] first_aid search_query={search_query!r}")
        return {
            **state,
            "category": "응급처치",
            "search_query": search_query,
            "policy_category": "",
            "collections": ["first_aid"],
        }

    # parenting / counseling: Gemini 호출 없이 바로 결정
    if mode in MODE_MAP:
        mapped = MODE_MAP[mode]
        return {
            **state,
            "category": mapped["category"],
            "search_query": state["query"],
            "policy_category": "",
            "collections": mapped["collections"],
        }

    # mode 없음: fallback 처리
    return {
        **state,
        "category": "",
        "search_query": state["query"],
        "policy_category": "",
        "collections": [],
    }


def search_rag(state: ChatState) -> ChatState:
    if not state["collections"]:
        return {**state, "context": "", "sources": [], "is_fallback": True}

    client, ef = _chroma_client()
    context_parts: list[str] = []
    sources: list[dict] = []

    for col_name in state["collections"]:
        try:
            col = client.get_collection(name=col_name, embedding_function=ef)
            title_key = TITLE_KEYS.get(col_name, "title")
            label = {
                "parent_policy": "복지정책",
                "child_guide": "아동 양육 사례",
                "parent_action": "양육 행동 사례",
                "first_aid": "응급처치",
            }.get(col_name, col_name)

            # parent_policy는 policy_category로 1차 필터링 시도
            where_filter = None
            if col_name == "parent_policy" and state.get("policy_category"):
                where_filter = {"category": state["policy_category"]}

            res = col.query(
                query_texts=[state["search_query"]],
                n_results=5,
                where=where_filter,
            )

            docs = res["documents"][0]
            metas = res["metadatas"][0]
            dists = res["distances"][0]

            # 필터 결과가 없으면 필터 없이 재시도
            if not docs and where_filter:
                res = col.query(
                    query_texts=[state["search_query"]],
                    n_results=5,
                )
                docs = res["documents"][0]
                metas = res["metadatas"][0]
                dists = res["distances"][0]

            print(f"[search_rag] col={col_name}  top5_distances={[round(d,4) for d in dists]}")
            for doc, meta, dist in zip(docs, metas, dists):
                if dist > MAX_DISTANCE:
                    continue
                title = meta.get(title_key) or meta.get("category", "")
                url = meta.get("detail_url", "")
                url_text = f"\n신청URL: {url}" if url else ""
                context_parts.append(f"[{label}: {title}]\n{doc}{url_text}")
                sources.append({"collection": col_name, "title": title, "url": url})

        except Exception:
            pass

    context = "\n\n---\n\n".join(context_parts)
    return {**state, "context": context, "sources": sources, "is_fallback": not bool(context)}


def generate_answer(state: ChatState) -> ChatState:
    gemini_history = [
        {"role": h["role"], "parts": [{"text": h["content"]}]}
        for h in state["history"]
    ]
    if state.get("mode") == "counseling":
        model = _gemini_model(COUNSELING_SYSTEM)
        prompt = state["query"]
    elif state["is_fallback"]:
        model = _gemini_model(FALLBACK_SYSTEM)
        prompt = state["query"]
    elif state.get("mode") == "first_aid":
        model = _gemini_model(FIRST_AID_SYSTEM)
        prompt = f"참고 자료:\n{state['context']}\n\n질문: {state['query']}"
    elif state.get("mode") == "parenting":
        model = _gemini_model(PARENTING_SYSTEM)
        prompt = f"참고 자료:\n{state['context']}\n\n질문: {state['query']}"
    else:
        model = _gemini_model(POLICY_SYSTEM)
        prompt = f"참고 자료:\n{state['context']}\n\n질문: {state['query']}"

    chat = model.start_chat(history=gemini_history)
    reply = chat.send_message(prompt).text
    return {**state, "reply": reply}


def _build_graph():
    g = StateGraph(ChatState)
    g.add_node("classify_and_rewrite", classify_and_rewrite)
    g.add_node("search_rag", search_rag)
    g.add_node("generate_answer", generate_answer)
    g.add_edge(START, "classify_and_rewrite")
    g.add_edge("classify_and_rewrite", "search_rag")
    g.add_edge("search_rag", "generate_answer")
    g.add_edge("generate_answer", END)
    return g.compile()


_graph = _build_graph()


def generate_reply(message: str, history: list[dict] | None = None, mode: str = "", policy_category: str = "") -> tuple[str, str, list[dict], bool]:
    initial: ChatState = {
        "query": message,
        "search_query": message,
        "history": history or [],
        "mode": mode,
        "category": "",
        "policy_category": policy_category,   # 프론트에서 직접 선택한 카테고리
        "collections": [],
        "context": "",
        "sources": [],
        "reply": "",
        "is_fallback": False,
    }
    result = _graph.invoke(initial)
    return result["reply"], result["category"], result["sources"], result["is_fallback"]
