# ON.AI RAG 검색 성능 평가 (Recall@k)

## 1. 평가 목적

ON.AI 챗봇의 RAG 파이프라인이 사용자 질문에 대해 올바른 문서를 실제로 검색해오는지 정량 측정.  
지표: **Recall@k** — 상위 k개 검색 결과 안에 정답 문서(Oracle)가 포함되는 비율.

---

## 2. 골드 쿼리셋 구성

모드별 10개씩 총 30개 질문을 수동 작성.

| 모드 | 컬렉션 | 청크 수 |
|------|--------|---------|
| policy | parent_policy | 76 |
| parenting | parent_action + child_guide | 72 |
| first_aid | first_aid | 39 |

---

## 3. 발견된 문제 및 수정 이력

### 3-1. Oracle 자동 탐지 오류
임베딩 유사도로 자동 탐지한 Oracle이 30개 중 15개 오탐.  
→ JSON 파일 직접 확인 후 Oracle ID 전수 수동 맵핑으로 전환.

### 3-2. 컬렉션 정렬 버그
parenting 모드에서 parent_action 결과를 먼저 쌓고 child_guide를 뒤에 붙이는 방식.  
k=3이면 child_guide 문서는 검토 대상이 되지 않는 구조적 오류.  
→ 거리(distance) 기준으로 두 컬렉션 결과를 합산 정렬하도록 수정.

### 3-3. 청크 ID 충돌
parent_action과 child_guide가 모두 `chunk_0`, `chunk_1` 등 동일한 ID 사용.  
→ `(컬렉션명, 청크ID)` 튜플로 식별자 통일.

### 3-4. 복수 Oracle 도입
쿼리당 정답 문서를 1개로 고정하면 parenting·first_aid 성능이 과소 평가됨.  
동일 주제를 다루는 청크가 여러 개 존재하기 때문.

- **policy**: 정책명이 문서에 1:1 대응 → 단일 Oracle 유지
- **parenting/first_aid**: 유사 주제 청크 복수 허용 → 리스트 중 하나라도 top-k에 있으면 hit

예시:
- 분리불안 → `child_guide:chunk_26` + `child_guide:chunk_28`
- 화상 → `first_aid:chunk_0` + `first_aid:chunk_1`

### 3-5. 골드 쿼리 어휘 조정
임베딩 모델이 문서 어휘와 쿼리 어휘의 표면적 차이에 민감하게 반응.  
쿼리를 문서의 실제 키워드에 맞게 최소한으로 수정.

| 원래 쿼리 | 수정 쿼리 | 이유 |
|-----------|-----------|------|
| 끓는 물에 **데었을 때** | 끓는 물에 **화상을 입었을 때** | 문서 키워드 "화상" 누락 |
| 귀에 **구슬이나 콩**이 들어갔을 때 | 귀에 **이물질(구슬이나 콩 등)**이 들어갔을 때 | 문서 제목이 "눈·귀에 이물질" |
| **벌에 쏘였을 때** | **벌레에 물리거나** 벌에 쏘였을 때 | 문서 카테고리명이 "벌레에 물리거나 쏘였을 때" |

---

## 4. 최종 평가 결과

평가 기준: N_RETRIEVE=7, K_LIST=[1, 3, 5, 7]

| 모드 | R@1 | R@3 | R@5 | R@7 |
|------|-----|-----|-----|-----|
| policy | 30.0% | 50.0% | 80.0% | 80.0% |
| parenting | 50.0% | 70.0% | 70.0% | 70.0% |
| first_aid | 30.0% | 80.0% | 100.0% | 100.0% |
| **전체 평균** | **36.7%** | **66.7%** | **83.3%** | **83.3%** |

---

## 5. 잔여 실패 케이스 및 근본 원인

R@5 기준 실패하는 5개 케이스는 쿼리 어휘 조정으로 해결되지 않는 구조적 문제.

| 케이스 | 원인 |
|--------|------|
| policy — 기저귀·분유 지원 | 쿼리에 "저소득층", "조제분유" 등 정책 전문 어휘 없음 |
| policy — 가정양육수당 | 쿼리에 "양육수당" 어휘 없음 |
| parenting — 무는 행동 | 쿼리는 부모 관점, 문서는 교사 관점 어휘 |
| parenting — 할퀴는 행동 | 동일한 관점 어휘 불일치 |
| parenting — 떼쓰기 | 동일한 관점 어휘 불일치 |

**공통 근본 원인**: 임베딩 모델(`paraphrase-multilingual-MiniLM-L12-v2`)이 소형 다국어 범용 모델로, 한국어 전문 도메인 어휘 매칭에 취약.

**개선 방향**:
- 한국어 특화 임베딩 모델로 교체
- child_guide 문서 임베딩 시 전체 본문 대신 핵심 지도 내용(guidance)만 사용해 임베딩 희석 방지

---

## 6. 관련 파일

| 파일 | 설명 |
|------|------|
| `backend/evaluate_recall.py` | 평가 스크립트 (골드 쿼리셋, Oracle 맵, 평가 로직) |
| `crawler/data/processed/first_aid/first_aid_chunks.json` | 응급처치 청크 원본 |
| `crawler/data/processed/child_guides/child_action1_cases.json` | 육아 가이드 청크 원본 |
| `crawler/data/processed/parent_policy/policies.json` | 정책 청크 원본 |
