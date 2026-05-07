import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]  # crawler/
RAW_PATH = BASE_DIR / "data" / "raw" / "first_aid.txt"
OUT_DIR = BASE_DIR / "data" / "chunks"
OUT_PATH = OUT_DIR / "first_aid_chunks.json"


def clean_text(text: str) -> str:
    text = text.replace("\ufeff", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def slugify(text: str) -> str:
    text = re.sub(r"[^\w가-힣]+", "_", text)
    text = re.sub(r"_+", "_", text)
    return text.strip("_").lower()


def split_first_aid_text(text: str) -> list[dict]:
    chunks = []

    current_category = None
    current_subcategory = None
    buffer = []

    def flush():
        nonlocal buffer

        content = clean_text("\n".join(buffer))
        if not content:
            buffer = []
            return

        chunk_id = f"first_aid_{len(chunks)+1:04d}"

        chunks.append({
            "id": chunk_id,
            "document": content,
            "metadata": {
                "source": "first_aid.txt",
                "category": current_category,
                "subcategory": current_subcategory,
                "title": current_subcategory or current_category,
                "topic_key": slugify(f"{current_category}_{current_subcategory or ''}"),
            }
        })

        buffer = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        if line.startswith("# "):
            flush()
            current_category = line.replace("# ", "").strip()
            current_subcategory = None

        elif line.startswith("## "):
            flush()
            current_subcategory = line.replace("## ", "").strip()

        else:
            buffer.append(line)

    flush()
    return chunks


def main():
    if not RAW_PATH.exists():
        raise FileNotFoundError(f"원본 파일을 찾을 수 없습니다: {RAW_PATH}")

    raw_text = RAW_PATH.read_text(encoding="utf-8")
    raw_text = clean_text(raw_text)

    chunks = split_first_aid_text(raw_text)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    OUT_PATH.write_text(
        json.dumps(chunks, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"JSON 생성 완료: {OUT_PATH}")
    print(f"총 청크 수: {len(chunks)}")


if __name__ == "__main__":
    main()