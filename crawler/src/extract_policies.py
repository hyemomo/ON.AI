import json, re
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))
from chunker import POLICY_METADATA

BASE = Path(__file__).resolve().parent.parent
JSON_PATH = BASE / "data" / "raw_json" / "document_parse_result.json"
OUT_PATH  = BASE / "data" / "policies.json"

SKIP = {"header", "footer", "figure"}
TOC_MAX_PAGE = 7

SPECIAL_HEADINGS = {
    "출생신고 완료전 미혼부 자녀 지원": "출생신고 완료전이라도",
    "양육비 이행확보 지원 서비스":       "양육비 이행확보를 위한 다양한 서비스를 제공합니다",
    # heading 직전에 지원대상 bullet이 먼저 나오는 PDF 레이아웃 quirk
    "에너지바우처":                     "기초생활수급가구 중 기후민감계층",
    # p50 요약 bullet 대신 p52 상세 페이지에 매칭
    "법률지원":                         "양육비에 관한 법률지원",
    "제재조치":                         "제재조치대상 법원으로부터",
    # p50 요약 bullet 대신 p54 상세 페이지에 매칭
    "모니터링":                         "지원방법 양육비 합의",
    # p37 요약(137자) 대신 p54 상세 페이지에 매칭
    "양육비 선지급제":                   "양육비 채권을 보유하고 있으나",
}

def norm(t):
    t = t.replace("Ⅰ", "I").replace("Ⅱ", "II")
    t = re.sub(r'\s+I\b', 'I', t)
    t = re.sub(r'\s+II\b', 'II', t)
    t = t.replace(",", "·")
    t = re.sub(r'·\s+', '·', t)
    return t

def find_heading(body, policy_name):
    search = SPECIAL_HEADINGS.get(policy_name, policy_name)
    n = norm(search)
    for e in body:
        t = norm(e["content"]["text"].strip())
        if t == n:
            return e
        if t.startswith(n + " ") or t.startswith(n + "("):
            return e
        if n in t and t.index(n) < 15:
            return e
        if t.endswith(n):
            return e
    return None

def build_divider_pages(els):
    """챕터 구분 페이지 집합 반환 (종합안내서 포함 페이지 + 이후 2페이지)."""
    anchor_pages = {
        e["page"] for e in els
        if e["page"] > TOC_MAX_PAGE
        and e["category"] not in SKIP
        and "종합안내서" in e["content"]["text"]
    }
    result = set()
    for p in anchor_pages:
        result.update({p, p + 1, p + 2})
    return result

def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        els = json.load(f)["elements"]

    divider_pages = build_divider_pages(els)

    body = [e for e in els
            if e["category"] not in SKIP
            and e["page"] > TOC_MAX_PAGE
            and e["page"] not in divider_pages
            and e["content"]["text"].strip()]

    starts = []
    missing = []
    for name in POLICY_METADATA:
        elem = find_heading(body, name)
        if elem:
            starts.append((body.index(elem), name))
        else:
            missing.append(name)
            print(f"[미발견] {name}")

    if missing:
        print(f"\n총 {len(missing)}개 미발견 — 종료")
        return

    starts.sort()

    results = []
    for i, (start_idx, name) in enumerate(starts):
        end_idx = starts[i + 1][0] if i + 1 < len(starts) else len(body)
        texts = [e["content"]["text"].strip() for e in body[start_idx:end_idx]]
        chunk_text = "\n".join(t for t in texts if t)

        meta = POLICY_METADATA[name]
        results.append({
            "policy_name": name,
            "page": body[start_idx]["page"],
            **meta,
            "text": chunk_text,
        })

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"저장 완료: {len(results)}개 → {OUT_PATH}")

if __name__ == "__main__":
    main()
