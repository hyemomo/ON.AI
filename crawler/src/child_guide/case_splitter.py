import re
from difflib import SequenceMatcher


CASE_KEYWORDS = [
    "경우",
    "행동",
    "아이",
    "변비",
    "빈뇨",
    "비만",
]


EXCLUDE_KEYWORDS = [
    "사례목록",
    "문제행동",
    "지도 방안",
    "지도의 실제",
    "원인 분석",
    "지도 방법",
    "예방적 접근",
    "유의사항",
    "참고사항",
    "상호작용",
    "자료:",
    "그림",
    "표",
    "제1부",
    "제2부",
    "제3부",
    "제4부",
    "제5부",
    "제6부",
    "제7부",
]


def normalize_title(text: str) -> str:
    text = re.sub(r"\s+", "", text)
    text = text.replace("·", "")
    text = text.replace("∙", "")
    text = text.replace("･", "")
    text = text.replace(".", "")
    text = text.replace(":", "")
    return text.strip()


def clean_toc_line(line: str) -> str:
    line = line.strip()
    line = re.sub(r"^\d{1,2}\s*[\.\)]?\s*", "", line)
    line = re.split(r"[·∙]{2,}|\.{2,}", line)[0].strip()
    line = re.sub(r"\s+\d+$", "", line).strip()
    return line


def is_case_title(title: str) -> bool:
    if not title:
        return False

    if len(title) < 2 or len(title) > 80:
        return False

    if any(keyword in title for keyword in EXCLUDE_KEYWORDS):
        return False

    if not any(keyword in title for keyword in CASE_KEYWORDS):
        return False

    return True


def is_real_case_position(full_text: str, position: int, window: int = 2500) -> bool:
    nearby_text = full_text[position: position + window]

    has_cause = re.search(r"가\.\s*원인\s*분석", nearby_text)
    has_guidance = re.search(r"나\.\s*지도\s*방법", nearby_text)

    return bool(has_cause and has_guidance)


def extract_case_titles_from_toc(toc_text: str) -> list[dict]:
    titles = []

    for line in toc_text.splitlines():
        cleaned_title = clean_toc_line(line)

        if not is_case_title(cleaned_title):
            continue

        if cleaned_title in [item["case_title"] for item in titles]:
            continue

        titles.append(
            {
                "case_number": f"{len(titles) + 1:02d}",
                "case_title": cleaned_title,
            }
        )

    return titles


def find_exact_title_position(full_text: str, title: str) -> int | None:
    target = normalize_title(title)

    cursor = 0

    for line in full_text.splitlines():
        line_start = full_text.find(line, cursor)
        cursor = line_start + len(line) if line_start != -1 else cursor + len(line)

        stripped_line = line.strip()

        if not stripped_line:
            continue

        if stripped_line.startswith("[[PAGE:"):
            continue

        stripped_line_without_number = re.sub(
            r"^\d{1,2}\s*[\.\)]?\s*",
            "",
            stripped_line,
        ).strip()

        if normalize_title(stripped_line_without_number) != target:
            continue

        if not is_real_case_position(full_text, line_start):
            continue

        return line_start

    return None


def find_fuzzy_title_position(
    full_text: str,
    title: str,
    threshold: float = 0.82,
) -> int | None:
    target = normalize_title(title)

    best_score = 0
    best_position = None

    cursor = 0

    for line in full_text.splitlines():
        line_start = full_text.find(line, cursor)
        cursor = line_start + len(line) if line_start != -1 else cursor + len(line)

        stripped_line = line.strip()

        if not stripped_line:
            continue

        if stripped_line.startswith("[[PAGE:"):
            continue

        if not is_case_title(stripped_line):
            continue

        if not is_real_case_position(full_text, line_start):
            continue

        candidate = re.sub(
            r"^\d{1,2}\s*[\.\)]?\s*",
            "",
            stripped_line,
        ).strip()

        candidate_normalized = normalize_title(candidate)
        score = SequenceMatcher(None, target, candidate_normalized).ratio()

        if score > best_score:
            best_score = score
            best_position = line_start

    if best_score >= threshold:
        return best_position

    return None


def find_case_starts_by_toc(
    full_text: str,
    toc_case_titles: list[dict],
) -> tuple[list[dict], list[dict]]:
    found_cases = []
    missing_cases = []

    for item in toc_case_titles:
        case_number = item["case_number"]
        case_title = item["case_title"]

        position = find_exact_title_position(full_text, case_title)
        match_type = "exact"

        if position is None:
            position = find_fuzzy_title_position(full_text, case_title)
            match_type = "fuzzy"

        if position is None:
            missing_cases.append(
                {
                    "case_number": case_number,
                    "case_title": case_title,
                    "found": False,
                }
            )
            continue

        found_cases.append(
            {
                "case_number": case_number,
                "case_title": case_title,
                "start_index": position,
                "end_index": position + len(case_title),
                "found": True,
                "match_type": match_type,
            }
        )

    found_cases.sort(key=lambda item: item["start_index"])

    return found_cases, missing_cases


def build_case_start_debug(case_starts: list[dict]) -> list[dict]:
    return case_starts


def build_raw_cases(
    full_text: str,
    case_starts: list[dict],
) -> list[dict]:
    raw_cases = []

    for index, item in enumerate(case_starts):
        start = item["start_index"]

        if index + 1 < len(case_starts):
            end = case_starts[index + 1]["start_index"]
        else:
            end = len(full_text)

        case_text = full_text[start:end].strip()

        raw_cases.append(
            {
                "case_number": item["case_number"],
                "case_title": item["case_title"],
                "raw_text": case_text,
            }
        )

    return raw_cases


def extract_section_text(
    toc_text: str,
    start_marker: str,
    end_marker: str | None = None,
) -> str:
    start_index = toc_text.find(start_marker)

    if start_index == -1:
        return ""

    if end_marker is None:
        return toc_text[start_index:]

    end_index = toc_text.find(end_marker, start_index)

    if end_index == -1:
        return toc_text[start_index:]

    return toc_text[start_index:end_index]