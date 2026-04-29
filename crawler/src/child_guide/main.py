from src.child_guide.case_parser import parse_single_case
from src.child_guide.case_splitter import (
    build_raw_cases,
    extract_case_titles_from_toc,
    extract_section_text,
    find_case_starts_by_toc,
)
from src.child_guide.config import OUTPUT_PATH, PDF_PATH, PROCESSED_DIR
from src.child_guide.domain_detector import (
    build_domain_full_text,
    extract_toc_pages_by_range,
)
from src.child_guide.file_utils import save_json
from src.child_guide.pdf_extractor import extract_pages


DOMAIN_CONFIGS = [
    {
        "domain": "사회성발달영역",
        "toc_start": "제4부. 각 론 : 사회성발달영역",
        "toc_end": "제5부. 각 론 : 정서발달영역",
    },
    {
        "domain": "정서발달영역",
        "toc_start": "제5부. 각 론 : 정서발달영역",
        "toc_end": "제6부. 각 론 : 언어발달영역",
    },
]


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    pages = extract_pages(PDF_PATH)

    _, toc_text = extract_toc_pages_by_range(
        pages=pages,
        start_page=4,
        end_page=11,
    )

    all_cases = []

    for domain_config in DOMAIN_CONFIGS:
        target_domain = domain_config["domain"]
        toc_start = domain_config["toc_start"]
        toc_end = domain_config["toc_end"]

        _, full_text = build_domain_full_text(
            pages=pages,
            target_domain=target_domain,
        )

        section_toc_text = extract_section_text(
            toc_text=toc_text,
            start_marker=toc_start,
            end_marker=toc_end,
        )

        toc_case_titles = extract_case_titles_from_toc(section_toc_text)

        case_starts, _ = find_case_starts_by_toc(
            full_text=full_text,
            toc_case_titles=toc_case_titles,
        )

        raw_cases = build_raw_cases(
            full_text=full_text,
            case_starts=case_starts,
        )

        for raw_case in raw_cases:
            structured_case = parse_single_case(
                source_name=PDF_PATH.name,
                domain=target_domain,
                case_number=raw_case["case_number"],
                case_title=raw_case["case_title"],
                case_text=raw_case["raw_text"],
            )

            all_cases.append(structured_case)

    save_json(OUTPUT_PATH, all_cases)


if __name__ == "__main__":
    main()