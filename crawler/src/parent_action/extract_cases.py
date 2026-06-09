#!/usr/bin/env python3
"""
parse_parent_action.json → parent_action_cases.json

Upstage Document Parse JSON → structured case records for ChromaDB
"""
import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
JSON_PATH = BASE_DIR / "data" / "raw_json" / "parse_parent_action.json"
OUT_PATH  = BASE_DIR / "data" / "processed" / "parent_action" / "parent_action_cases.json"

SKIP_CATEGORIES = {"header", "footer", "figure", "caption", "table", "index"}
CONTENT_START_PAGE = 28

DOMAINS = [
    "기본생활영역", "신체운동발달영역", "사회성발달영역",
    "정서발달영역", "언어발달영역", "인지발달영역",
]

# 사례 제목 패턴: 숫자 + 한국어 키워드로 시작
CASE_TITLE_PAT = re.compile(
    r"^\d+[\.\s]\s*"
    r"(?:우리 아이|아이가|아이는|대화 시|사회성이|흉내 내기|집중이 어려운|한글놀이)"
)

# 개요/소개 섹션으로 걸러낼 키워드 (사례 제목에서 제외)
SKIP_TITLE_KEYWORDS = [
    "어떻게 도울 수 있을까요",
    "어떻게 이루어질까요",
    "어떻게 발달할까요",
    "왜 중요할까요",
    "왜 불안해할까요",
    "어떤 것이 있을까요",
    "알아볼까요",
    "인지 발달의 신호",
    "지나친 고집은 어떻게 할까요",
    "어떤 배변습관이 문제",
    "어떤 행동을 편식",
    "어떤 고집이나 반항이 문제",
    "사회성은 타고나는",
    "영아기 언어발달은 어떻게",
    "유아기 언어발달은 어떻게",
    "주의집중력의 특징",
]

# 연령 태그: <11개월>, <3세> 등
AGE_PAT = re.compile(r"^<(\d+(?:세|개월))>$")

# 섹션 마커: |, I 로 시작하고 바로 한글이 오는 패턴
SECTION_MARKER = re.compile(r"^[|I]\s*(?=[가-힣])")


def get_text(element: dict) -> str:
    content = element.get("content", {})
    return (content.get("text", "") if isinstance(content, dict) else "").strip()


def detect_domain(text: str) -> str | None:
    for d in DOMAINS:
        if d in text:
            return d
    return None


def is_domain_marker(text: str) -> bool:
    return text.strip() in DOMAINS


def get_section_type(text: str) -> str | None:
    """섹션 헤더 종류 반환: 'cause' / 'guidance' / 'notes' / 'activity' / None."""
    t = text.strip()
    if not SECTION_MARKER.match(t):
        return None
    inner = re.sub(r"^[|I]\s*", "", t)

    if re.search(r"왜|무엇에 어려움", inner):
        return "cause"
    if re.search(r"어떻게 도와줄|아이를 어떻게 도와", inner):
        return "guidance"
    if re.search(r"이런 점.{0,3}주의", inner):
        return "notes"
    if re.search(r"아이와 함께|아이에게 알려|아이에게 이렇게|아이에게 말해|흉내내기 놀이", inner):
        return "activity"
    return None  # 인식 불가 섹션 헤더 → 스킵


def is_case_title(text: str) -> bool:
    first_line = text.split("\n")[0].strip()
    if not CASE_TITLE_PAT.match(first_line):
        return False
    # 줄바꿈 정규화 후 전체 텍스트로 개요 키워드 검사
    normalized = re.sub(r"\s+", " ", text.strip())
    return not any(kw in normalized for kw in SKIP_TITLE_KEYWORDS)


def clean_title(text: str) -> str:
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    joined = " ".join(lines)
    return re.sub(r"^\d+[\.\s]\s*", "", joined).strip()


def build_cases(elements: list[dict]) -> list[dict]:
    current_domain: str | None = None
    groups: list[tuple[str | None, list[dict]]] = []
    current_group: list[dict] = []
    in_case = False
    case_domain: str | None = None

    for e in elements:
        if e["page"] < CONTENT_START_PAGE:
            continue
        text = get_text(e)
        if not text:
            continue

        # 도메인 추적은 모든 카테고리(header 포함)에서 수행
        d = detect_domain(text)
        if d:
            current_domain = d

        if e["category"] in SKIP_CATEGORIES:
            continue

        # 사례 제목 감지 (heading1 또는 paragraph)
        if e["category"] in ("heading1", "paragraph") and is_case_title(text):
            if in_case and current_group:
                groups.append((case_domain, current_group))
            current_group = [e]
            case_domain = current_domain
            in_case = True
        elif in_case:
            current_group.append(e)

    if in_case and current_group:
        groups.append((case_domain, current_group))

    cases = []
    for idx, (domain, group) in enumerate(groups):
        title_text = get_text(group[0])
        case_title = clean_title(title_text)

        age = None
        situation, cause, guidance, notes = [], [], [], []
        section = "situation"
        seen_age = False

        for e in group[1:]:
            text = get_text(e)
            if not text:
                continue

            # 도메인 마커는 컨텐츠에 포함하지 않음
            if is_domain_marker(text):
                continue

            # 연령 태그 (사례 제목 직후 heading1)
            if not seen_age and e["category"] == "heading1" and AGE_PAT.match(text):
                age = AGE_PAT.match(text).group(1)
                seen_age = True
                continue

            # 섹션 타입 결정
            stype = get_section_type(text)
            if stype == "cause":
                section = "cause"
                continue
            elif stype == "guidance":
                section = "guidance"
                continue
            elif stype == "notes":
                section = "notes"
                continue
            elif stype == "activity":
                section = "activity"
                continue
            elif stype is None and SECTION_MARKER.match(text):
                # 인식 불가 섹션 헤더는 컨텐츠에서 제외
                continue

            if section == "situation":
                situation.append(text)
            elif section == "cause":
                cause.append(text)
            elif section == "guidance":
                guidance.append(text)
            elif section == "notes":
                notes.append(text)

        pages = [e["page"] for e in group]
        page_start, page_end = min(pages), max(pages)

        # ChromaDB 임베딩용 전체 텍스트
        parts = [f"제목: {case_title}"]
        if domain:
            parts.append(f"영역: {domain}")
        if age:
            parts.append(f"연령: {age}")
        if situation:
            parts.append("상황: " + " ".join(situation))
        if cause:
            parts.append("원인 분석: " + " ".join(cause))
        if guidance:
            parts.append("지도 방법: " + " ".join(guidance))
        if notes:
            parts.append("유의사항: " + " ".join(notes))

        cases.append({
            "source": "parse_parent_action.json",
            "domain": domain or "",
            "case_number": f"{idx + 1:02d}",
            "case_title": case_title,
            "age": age or "",
            "situation": "\n".join(situation).strip(),
            "cause_analysis": "\n".join(cause).strip(),
            "guidance": "\n".join(guidance).strip(),
            "notes": "\n".join(notes).strip(),
            "page_start": page_start,
            "page_end": page_end,
            "text": "\n".join(parts),
        })

    return cases


def main() -> None:
    print(f"Loading {JSON_PATH.name} ...")
    with open(JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)

    elements: list[dict] = data["elements"]
    print(f"Total elements: {len(elements)}")

    cases = build_cases(elements)
    print(f"Extracted cases: {len(cases)}")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cases, f, ensure_ascii=False, indent=2)
    print(f"Saved → {OUT_PATH}")
    print()

    for c in cases:
        has_guidance = "O" if c["guidance"] else "X"
        print(
            f"  [{c['case_number']}] p{c['page_start']:03d}-p{c['page_end']:03d}"
            f" [{c['domain']}] {c['case_title'][:55]}"
            f"  guidance={has_guidance}"
        )


if __name__ == "__main__":
    main()
