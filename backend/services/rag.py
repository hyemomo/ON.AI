import json
import re

import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict

from config import CHROMA_DIR, EMBEDDING_MODEL, GEMINI_API_KEY

CATEGORY_MAP: dict[str, list[str]] = {
    "육아": ["child_guide", "parent_action"],
    "정책": ["parent_policy"],
    "응급대처": ["first_aid"],
    "기타": [],
}

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

POLICY_CATEGORIES = {"임신출산", "양육돌봄", "시설주거", "교육취업", "금융법률", "기타"}

POLICY_MODE_PROMPT = """복지정책 질문에서 핵심 검색 키워드와 분류를 추출하세요.

분류 기준:
- 임신출산: 임신, 출산, 산모, 신생아, 분만 관련
- 양육돌봄: 아동수당, 양육비, 보육, 돌봄, 아동발달 관련
- 시설주거: 주거, 매입임대, 공동생활가정, 임대 관련
- 교육취업: 교육, 직업, 취업, 훈련, 장학금 관련
- 금융법률: 금융, 법률, 대출, 법적 지원 관련
- 기타: 위에 해당하지 않거나 여러 분야에 걸친 질문

search_query 규칙:
- 질문에 정책명이 명확히 언급된 경우 정책명을 그대로 사용하세요. 절대 "지원대상", "지원내용", "신청방법" 같은 단어를 추가하지 마세요.
- 나이·지역 등 개인정보는 제거하고 정책 핵심 키워드만 남기세요.
예) "온가족보듬사업에 대해 자세히 설명해줘" → "온가족보듬사업"
예) "27세 춘천 주거 지원 받고 싶어" → "주거 지원 한부모"
예) "아동양육비 어떻게 신청해?" → "아동양육비 신청"

{history_block}질문: {query}

반드시 아래 JSON 형식으로만 답하세요:
{{"search_query": "검색 키워드", "policy_category": "분류명"}}"""

CLASSIFY_AND_REWRITE_PROMPT = """다음 사용자 질문을 분석하여 JSON으로 답하세요.

카테고리:
- 육아: 아이 발달, 훈육, 수면, 식습관, 행동, 정서 등 양육 전반
- 정책: 복지 혜택, 지원금, 수당, 서비스 신청 방법 등 정부/기관 정책
- 응급대처: 아이 부상, 발열, 사고, 응급 상황 대응 방법
- 기타: 위 세 카테고리에 해당하지 않는 내용

search_query: 질문에서 핵심 키워드만 추출해 검색에 최적화된 짧은 구문으로 변환하세요.
"더 자세히", "URL 알려줘", "신청 방법은?" 같은 후속 질문은 이전 대화 맥락을 참고해 키워드를 추출하세요.
예) "출산지원시설에 대해서는?" → "출산지원시설"
예) "아동양육비 어떻게 신청해?" → "아동양육비 신청 방법"

policy_category: category가 "정책"일 때만 아래 중 가장 잘 맞는 것을 선택하세요. 해당 없으면 "".
- 임신출산: 임신, 출산, 산모, 신생아, 분만 관련
- 양육돌봄: 아동수당, 양육비, 보육, 돌봄, 아동발달 관련
- 시설주거: 주거, 매입임대, 공동생활가정, 임대 관련
- 교육취업: 교육, 직업, 취업, 훈련, 장학금 관련
- 금융법률: 금융, 법률, 대출, 법적 지원 관련
- 기타: 위에 해당하지 않는 정책, 또는 여러 분야에 걸친 광범위한 질문

{history_block}현재 질문: {query}

반드시 아래 JSON 형식으로만 답하세요:
{{"category": "카테고리명", "search_query": "검색 최적화 쿼리", "policy_category": "정책분류또는빈문자열"}}"""

RAG_SYSTEM = """당신은 한부모가족을 위한 전문 복지 도우미입니다.
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

PARENTING_RAG_SYSTEM = """당신은 한부모가족을 위한 육아 전문 상담사입니다.
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

FALLBACK_SYSTEM = """당신은 한부모가족을 위한 전문 도움 비서입니다.
이 질문은 데이터베이스에 없는 내용입니다.
일반적인 정보를 바탕으로 답변하되, 답변 끝에 반드시
"※ 이 답변은 일반적인 정보입니다. 정확한 내용은 관련 기관에 문의하세요."를 추가하세요."""

MAX_DISTANCE = 0.65


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
    return genai.GenerativeModel(model_name="gemini-3.1-flash-lite-preview", system_instruction=system)


def _chroma_client():
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    return client, ef


def classify_and_rewrite(state: ChatState) -> ChatState:
    mode = state.get("mode", "")

    # policy 모드: Gemini로 search_query + policy_category만 추출
    if mode == "policy":
        history = state.get("history", [])
        history_block = ""
        if history:
            recent = history[-6:]
            lines = "\n".join(f"  {h['role']}: {h['content'][:120]}" for h in recent)
            history_block = f"이전 대화:\n{lines}\n\n"

        model = _gemini_model("당신은 복지정책 검색 전문가입니다.")
        raw = model.generate_content(
            POLICY_MODE_PROMPT.format(query=state["query"], history_block=history_block)
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

        return {
            **state,
            "category": "복지정책",
            "search_query": search_query,
            "policy_category": policy_category,
            "collections": ["parent_policy"],
        }

    # parenting / first_aid / counseling: Gemini 호출 없이 바로 결정
    if mode in MODE_MAP:
        mapped = MODE_MAP[mode]
        return {
            **state,
            "category": mapped["category"],
            "search_query": state["query"],
            "policy_category": "",
            "collections": mapped["collections"],
        }

    # mode 없음: 기존 Gemini 분류 흐름
    history = state.get("history", [])
    if history:
        recent = history[-6:]
        lines = "\n".join(
            f"  {h['role']}: {h['content'][:120]}" for h in recent
        )
        history_block = f"이전 대화:\n{lines}\n\n"
    else:
        history_block = ""

    model = _gemini_model("당신은 질문 분류 및 검색 쿼리 최적화 전문가입니다.")
    raw = model.generate_content(
        CLASSIFY_AND_REWRITE_PROMPT.format(query=state["query"], history_block=history_block)
    ).text.strip()

    try:
        cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
        parsed = json.loads(cleaned)
        category = parsed.get("category", "기타")
        search_query = parsed.get("search_query", state["query"])
        policy_category = parsed.get("policy_category", "")
    except Exception:
        category = "기타"
        search_query = state["query"]
        policy_category = ""

    if category not in CATEGORY_MAP:
        category = "기타"

    if policy_category not in POLICY_CATEGORIES or policy_category == "기타":
        policy_category = ""

    return {
        **state,
        "category": category,
        "search_query": search_query,
        "policy_category": policy_category,
        "collections": CATEGORY_MAP[category],
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
    if state["is_fallback"]:
        model = _gemini_model(FALLBACK_SYSTEM)
        prompt = state["query"]
    elif state.get("mode") == "parenting":
        model = _gemini_model(PARENTING_RAG_SYSTEM)
        prompt = f"참고 자료:\n{state['context']}\n\n질문: {state['query']}"
    else:
        model = _gemini_model(RAG_SYSTEM)
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


def generate_reply(message: str, history: list[dict] | None = None, mode: str = "") -> tuple[str, str, list[dict], bool]:
    initial: ChatState = {
        "query": message,
        "search_query": message,
        "history": history or [],
        "mode": mode,
        "category": "",
        "policy_category": "",
        "collections": [],
        "context": "",
        "sources": [],
        "reply": "",
        "is_fallback": False,
    }
    result = _graph.invoke(initial)
    return result["reply"], result["category"], result["sources"], result["is_fallback"]
