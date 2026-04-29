def extract_toc_pages_by_range(
    pages: list[dict],
    start_page: int,
    end_page: int,
) -> tuple[list[dict], str]:
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