import fitz
from tqdm import tqdm
from pathlib import Path

def extract_pages(pdf_path: Path) -> list[dict]:
    """
    PDF를 페이지 단위 텍스트로 추출
    """
    doc = fitz.open(pdf_path)
    pages = []

    for page_index in tqdm(range(len(doc)), desc="PDF 페이지 추출 중"):
        page = doc[page_index]
        text = page.get_text("text")

        pages.append(
            {
                "page": page_index + 1,
                "text": text.strip(),
            }
        )

    return pages