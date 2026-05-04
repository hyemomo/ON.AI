from src.child_guide.text_cleaner import normalize_text, remove_headers

DOMAINS = [
    "기본생활영역",
    "신체운동발달영역",
    "사회성발달영역",
    "정서발달영역",
    "언어발달영역",
    "인지발달영역",
]


def detect_domain(text: str) -> str | None:
    """
    페이지 텍스트에서 영역명 감지
    """
    for domain in DOMAINS:
        if domain in text:
            return domain

    return None


def build_domain_full_text(
    pages: list[dict],
    target_domain: str,
) -> tuple[list[dict], str]:
    """
    특정 영역 페이지만 모으고,
    사례 분리를 위한 full_text까지 생성
    """
    domain_pages = []
    current_domain = None

    for page in pages:
        page_text = page["text"]
        detected_domain = detect_domain(page_text)

        if detected_domain:
            current_domain = detected_domain

        if current_domain == target_domain:
            domain_pages.append(page)

    full_text_parts = []

    for page in domain_pages:
        cleaned_text = remove_headers(page["text"])
        cleaned_text = normalize_text(cleaned_text)

        full_text_parts.append(
            f"\n\n[[PAGE:{page['page']}]]\n{cleaned_text}"
        )

    full_text = "\n".join(full_text_parts)

    return domain_pages, full_text
def extract_toc_pages_by_range(
    pages: list[dict],
    start_page: int,
    end_page: int,
) -> tuple[list[dict], str]:
    """
    목차 페이지를 페이지 범위로 추출
    """
    toc_pages = [
        page for page in pages
        if start_page <= page["page"] <= end_page
    ]

    toc_text_parts = []

    for page in toc_pages:
        toc_text_parts.append(
            f"\n\n[[PAGE:{page['page']}]]\n{page['text']}"
        )

    toc_text = "\n".join(toc_text_parts)

    return toc_pages, toc_text