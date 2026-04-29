import re

from src.child_guide.text_cleaner import normalize_text


def extract_page_range(case_text: str) -> tuple[int | None, int | None]:
    pages = re.findall(r"\[\[PAGE:(\d+)\]\]", case_text)

    if not pages:
        return None, None

    pages = [int(page) for page in pages]
    return min(pages), max(pages)


def extract_age(case_text: str) -> str:
    match = re.search(r"만\s*\d+\s*세", case_text)

    if not match:
        return ""

    return match.group().replace(" ", "")


def remove_page_markers(text: str) -> str:
    return re.sub(r"\[\[PAGE:\d+\]\]", "", text).strip()


def clean_text(text: str) -> str:
    text = remove_page_markers(text)
    return normalize_text(text)


def extract_between(
    text: str,
    start_pattern: str,
    end_pattern: str | None = None,
) -> str:
    text = remove_page_markers(text)

    start_match = re.search(start_pattern, text)

    if not start_match:
        return ""

    start = start_match.end()

    if end_pattern:
        end_match = re.search(end_pattern, text[start:])

        if end_match:
            end = start + end_match.start()
            return clean_text(text[start:end])

    return clean_text(text[start:])


def extract_situation(case_text: str, case_title: str) -> str:
    text = remove_page_markers(case_text)

    text = re.sub(
        rf"^\s*{re.escape(case_title)}",
        "",
        text,
    ).strip()

    return extract_between(
        text,
        start_pattern=r"^",
        end_pattern=r"가\.\s*원인\s*분석",
    )


def parse_single_case(
    source_name: str,
    domain: str,
    case_number: str,
    case_title: str,
    case_text: str,
) -> dict:
    case_text = str(case_text)

    page_start, page_end = extract_page_range(case_text)
    age = extract_age(case_text)
    situation = extract_situation(case_text, case_title)

    cause_analysis = extract_between(
        case_text,
        start_pattern=r"가\.\s*원인\s*분석",
        end_pattern=r"나\.\s*지도\s*방법",
    )

    guidance = extract_between(
        case_text,
        start_pattern=r"나\.\s*지도\s*방법",
        end_pattern=r"다\.\s*유의\s*사항",
    )

    notes = extract_between(
        case_text,
        start_pattern=r"다\.\s*유의\s*사항",
    )

    return {
        "source": source_name,
        "domain": domain,
        "case_number": case_number,
        "case_title": case_title,
        "age": age,
        "situation": situation,
        "cause_analysis": cause_analysis,
        "guidance": guidance,
        "notes": notes,
        "page_start": page_start,
        "page_end": page_end,
    }


def split_cases_by_title_list(
    raw_text: str,
    case_titles: list[str],
) -> list[dict]:
    title_pattern = "|".join(re.escape(title) for title in case_titles)

    pattern = re.compile(rf"(?m)^({title_pattern})\s*$")
    matches = list(pattern.finditer(raw_text))
    cases = []

    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(raw_text)

        case_title = match.group(1)
        case_text = raw_text[start:end].strip()

        cases.append(
            {
                "case_number": str(index + 1).zfill(2),
                "case_title": case_title,
                "case_text": case_text,
            }
        )

    return cases


def parse_cases_by_title_list(
    raw_text: str,
    case_titles: list[str],
    source_name: str,
    domain: str,
) -> list[dict]:
    split_cases = split_cases_by_title_list(raw_text, case_titles)
    structured_cases = []

    for case in split_cases:
        parsed = parse_single_case(
            source_name=source_name,
            domain=domain,
            case_number=case["case_number"],
            case_title=case["case_title"],
            case_text=case["case_text"],
        )

        structured_cases.append(parsed)

    return structured_cases