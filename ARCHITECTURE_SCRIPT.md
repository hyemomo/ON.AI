# ON.AI 아키텍처 이미지 생성 스크립트

아래 텍스트를 Gemini / GPT 이미지 생성 프롬프트로 사용하세요.

---

## 이미지 생성 프롬프트 (영문)

```
Create a clean, modern system architecture diagram for an AI chatbot called "ON.AI" 
designed for single-parent families in Korea. Use a light pink and white color scheme 
with soft pastel accents. The diagram should flow from left to right in 4 main stages:

STAGE 1 — DATA COLLECTION (leftmost):
- Three document source icons at the top:
  1. PDF icon labeled "Child Guide PDF" (교사용 육아 가이드 PDF)
  2. Web icon labeled "Government Website" (복지로 정책 웹사이트)
  3. Text file icon labeled "First Aid Text" (응급처치 텍스트)
- Below each: small crawler/spider icon showing automated scraping
- Arrow pointing down to a "Data Processing" box showing:
  - Text cleaning
  - Chunking (split into 39~76 chunks per domain)

STAGE 2 — VECTOR DATABASE (center-left):
- A cylinder database icon labeled "ChromaDB"
- Inside or below it, show 4 colored collection boxes:
  1. Blue: "parent_policy" — 76 chunks (복지정책)
  2. Green: "parent_action" — 19 chunks (육아행동지침)
  3. Orange: "child_guide" — 53 chunks (교사 육아가이드)
  4. Red: "first_aid" — 39 chunks (응급처치)
- Above ChromaDB: a small model icon labeled 
  "Embedding Model: paraphrase-multilingual-MiniLM-L12-v2"
  with an arrow showing text → vector transformation

STAGE 3 — RAG PIPELINE (center-right):
Show a vertical LangGraph flow with 3 nodes connected by arrows:

Node 1 (top): "classify_and_rewrite"
- Input: user query
- Shows 4 mode options as small tags: 복지정책 / 육아방법 / 응급처치 / 상담
- Shows query rewriting example:
  "27세 주거 지원" → "한부모 주거 지원" (policy keyword injection)

Node 2 (middle): "search_rag"
- Arrow from ChromaDB pointing in
- Shows cosine similarity search
- Returns top-k chunks (policy:5, parenting:2+2, first_aid:5)
- Label: "distance-based merged ranking"

Node 3 (bottom): "generate_answer"  
- Input: retrieved chunks as context
- Large LLM icon labeled "Gemini 3.1 Flash Lite (gemini-3.1-flash-lite)"
- Shows system prompt injection (mode-specific instructions)
- Shows fallback branch: if counseling mode → ACT-based response (no DB search)
- Output arrow: structured response with sources

STAGE 4 — FRONTEND (rightmost):
- Mobile phone mockup showing the chat UI
- Pink/white chat bubbles
- 4 mode selection buttons at bottom: 📋복지정책 👶육아방법 🚑응급처치 💬상담
- Source card shown below AI bubble
- Labels: "React + Mantine UI" and "Vite proxy → FastAPI"

CONNECTING ELEMENTS:
- A user icon on the far left with "사용자 질문" arrow going into Stage 3
- A final arrow from Stage 4 back to user labeled "답변 + 출처"
- Small FastAPI logo between Stage 3 and Stage 4

STYLE NOTES:
- Clean flat design, no shadows
- Use rounded rectangles for all boxes
- Color code by domain: pink=policy, green=parenting, red=first_aid, purple=counseling
- Font: modern sans-serif, bilingual labels (Korean + English)
- Overall size: wide landscape format (16:9)
```

---

## 한국어 설명 요약 (발표 자료용)

**ON.AI 시스템 동작 흐름**

```
[데이터 수집]
PDF (육아가이드) → 텍스트 추출 → 청크 분할
웹 크롤링 (복지로) → 정책 파싱 → 청크 분할
텍스트 파일 (응급처치) → 파싱 → 청크 분할
        ↓
[벡터 임베딩]
paraphrase-multilingual-MiniLM-L12-v2 모델로 각 청크를 768차원 벡터로 변환
        ↓
[ChromaDB 저장]
parent_policy  76청크 │ parent_action 19청크
child_guide    53청크 │ first_aid     39청크
총 187개 청크, 4개 컬렉션
        ↓
[사용자 질문 입력]
React 프론트엔드 → FastAPI → LangGraph 파이프라인 진입
        ↓
[Node 1: classify_and_rewrite]
Gemini가 모드 판별 (복지정책 / 육아방법 / 응급처치 / 상담)
쿼리 재작성: "27세 춘천 주거 지원" → "한부모 주거 지원"
            "아이가 물에 데었어요" → "화상 응급처치"
        ↓
[Node 2: search_rag]
해당 컬렉션에서 코사인 유사도 검색
거리 기반 정렬로 상위 k개 청크 선택
(정책:5개 / 육아:컬렉션당 2개 / 응급:5개)
        ↓
[Node 3: generate_answer]
검색된 청크를 컨텍스트로 Gemini 2.5 Flash (gemini-3.1-flash-lite)에 전달
모드별 시스템 프롬프트 적용
출처 카드 + 카테고리 뱃지와 함께 답변 반환
        ↓
[응답]
React 채팅창에 AI 답변 + 참고 문서 출처 표시
```

---

## 핵심 수치 (다이어그램 라벨용)

| 항목 | 값 |
|------|-----|
| 임베딩 모델 | paraphrase-multilingual-MiniLM-L12-v2 |
| 벡터 차원 | 384차원 |
| 총 청크 수 | 187개 |
| LLM | gemini-3.1-flash-lite |
| 파이프라인 | LangGraph (3노드) |
| 백엔드 | FastAPI |
| 프론트엔드 | React + Mantine UI |
| 벡터DB | ChromaDB (로컬 영속) |
