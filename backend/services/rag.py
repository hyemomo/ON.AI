import google.generativeai as genai
import chromadb
from chromadb.utils import embedding_functions

from config import CHROMA_DIR, EMBEDDING_MODEL, GEMINI_API_KEY

SYSTEM_PROMPT = """당신은 한부모가족 복지 및 아동 양육 전문 상담사입니다.
아래 제공된 참고 자료를 바탕으로 사용자의 질문에 친절하고 정확하게 답변하세요.
참고 자료에 없는 내용은 추측하지 말고, 모른다고 솔직하게 말씀해 주세요.
답변은 한국어로 작성하고, 핵심 내용을 간결하게 전달하세요."""


def _get_collections():
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    return (
        client.get_collection(name="parent_policy", embedding_function=ef),
        client.get_collection(name="child_guide",   embedding_function=ef),
    )


def search_context(query: str, n_results: int = 3) -> tuple[str, list[dict]]:
    policy_col, guide_col = _get_collections()

    policy_res = policy_col.query(query_texts=[query], n_results=n_results)
    guide_res  = guide_col.query(query_texts=[query],  n_results=n_results)

    sources = []
    context_parts = []

    for doc, meta in zip(policy_res["documents"][0], policy_res["metadatas"][0]):
        context_parts.append(f"[복지정책: {meta.get('policy_name')}]\n{doc}")
        sources.append({"collection": "parent_policy", "title": meta.get("policy_name", "")})

    for doc, meta in zip(guide_res["documents"][0], guide_res["metadatas"][0]):
        context_parts.append(f"[아동 양육 사례: {meta.get('case_title')}]\n{doc}")
        sources.append({"collection": "child_guide", "title": meta.get("case_title", "")})

    return "\n\n---\n\n".join(context_parts), sources


def generate_reply(message: str) -> tuple[str, list[dict]]:
    context, sources = search_context(message)

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )

    prompt = f"참고 자료:\n{context}\n\n질문: {message}"
    response = model.generate_content(prompt)

    return response.text, sources
