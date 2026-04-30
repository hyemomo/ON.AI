import re

DOMAINS = [
    "기본생활영역",
    "신체운동발달영역",
    "사회성발달영역",
    "정서발달영역",
    "언어발달영역",
    "인지발달영역",
]

def normalize_text(text: str) -> str:
    """
    불필요한 공백 정리
    """
    text = text.replace("\u200b", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def remove_headers(text: str) -> str:
    """
    반복되는 머리말/쪽번호 제거.
    단, '제4부. 각 론 : 사회성발달영역' 같은 영역 시작 제목은 보존.
    """
    lines = text.splitlines()
    cleaned_lines = []

    for line in lines:
        line = line.strip()

        if not line:
            continue

        if line == "영유아 문제행동 지도를 위한 어린이집 보육교사 지침서":
            continue

        if re.fullmatch(r"\d+", line):
            continue

        if line.startswith("제") and "각 론" in line:
            if any(domain in line for domain in DOMAINS):
                cleaned_lines.append(line)

            continue

        cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


def clean_page_markers(text: str) -> str:
    """
    [[PAGE:숫자]] 제거
    """
    text = re.sub(r"\[\[PAGE:\d+\]\]", "", text)
    return normalize_text(text)