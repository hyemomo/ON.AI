"""
policies.json 에 복지로 URL 및 연락처 정보를 추가한다.
한국사회보장정보원_복지서비스정보.csv 의 정책명과 매칭 후 enrichment.

실행:
    cd crawler
    python src/parent_policy/enrich_urls.py
"""

import json
import re
import shutil
import csv
from difflib import SequenceMatcher
from pathlib import Path

from config import OUT_PATH, BASE_DIR

CSV_PATH = BASE_DIR / "data" / "raw" / "한국사회보장정보원_복지서비스정보.csv"
FUZZY_THRESHOLD = 0.85

# CSV 매칭 후에도 URL 없는 정책에 API detail_url을 직접 주입
API_URL_MAP = {
    "양육비 이행지원 서비스":       "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003186&wlfareInfoReldBztpCd=01",
    "양육비 이행확보 지원 서비스":   "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003186&wlfareInfoReldBztpCd=01",
    "아동발달지원계좌":              "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003258&wlfareInfoReldBztpCd=01",
    "임신·출산 진료비 지원":         "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000061&wlfareInfoReldBztpCd=01",
    "산모건강관리":                  "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001188&wlfareInfoReldBztpCd=01",
    "저소득 한부모가족 아동양육비":  "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001109&wlfareInfoReldBztpCd=01",
    "드림스타트":                    "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003283&wlfareInfoReldBztpCd=01",
}

# 자동 매칭 실패 but CSV에 다른 이름으로 존재하는 정책 수동 매핑
MANUAL_MAP = {
    "청소년한부모 아동양육비":      "청소년한부모 아동양육 및 자립지원",
    "아동수당":                    "아동수당 지급",
    "보육료 지원":                  "영유아보육료 지원",
    "부모급여":                    "부모급여 지원",
    "여성청소년 생리용품 바우처":    "여성청소년 생리용품 지원",
    "자녀 교육비 지원":             "한부모가족자녀 교육비 지원",
}


def normalize(name: str) -> str:
    return re.sub(r"[^\w]", "", name).lower()


def load_csv(path: Path) -> list[dict]:
    rows = []
    with open(path, encoding="cp949", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def find_best_match(policy_name: str, csv_rows: list[dict]) -> dict | None:
    # 0단계: 수동 매핑
    if policy_name in MANUAL_MAP:
        csv_name = MANUAL_MAP[policy_name]
        for row in csv_rows:
            if row["서비스명"].strip() == csv_name:
                return row

    norm_target = normalize(policy_name)

    # 1단계: 정규화 후 exact match
    for row in csv_rows:
        if normalize(row["서비스명"]) == norm_target:
            return row

    # 2단계: fuzzy match
    best_ratio = 0.0
    best_row = None
    for row in csv_rows:
        ratio = SequenceMatcher(None, norm_target, normalize(row["서비스명"])).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_row = row

    if best_ratio >= FUZZY_THRESHOLD:
        return best_row

    return None


def main():
    # 원본 백업
    backup_path = OUT_PATH.with_name("policies_backup.json")
    shutil.copy(OUT_PATH, backup_path)
    print(f"백업 완료: {backup_path}")

    policies = json.loads(OUT_PATH.read_text(encoding="utf-8"))
    csv_rows = load_csv(CSV_PATH)

    matched, unmatched = [], []

    for policy in policies:
        name = policy["policy_name"]
        row = find_best_match(name, csv_rows)

        if row:
            policy["welfare_id"] = row.get("서비스아이디", "").strip()
            policy["site_url"] = row.get("서비스URL", "").strip()
            policy["contact"] = row.get("대표문의", "").strip()
            policy["ministry"] = row.get("소관부처명", "").strip()
            policy["organization"] = row.get("소관조직명", "").strip()
            matched.append(name)
        else:
            unmatched.append(name)

    # API URL 직접 주입 (CSV 매칭에서 누락된 정책)
    api_added = []
    for policy in policies:
        name = policy["policy_name"]
        if not policy.get("site_url") and name in API_URL_MAP:
            policy["site_url"] = API_URL_MAP[name]
            api_added.append(name)
            if name in unmatched:
                unmatched.remove(name)

    OUT_PATH.write_text(
        json.dumps(policies, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"\n=== 매칭 결과 ===")
    print(f"CSV 매칭: {len(matched)}개 / API 추가: {len(api_added)}개 / 미매칭: {len(unmatched)}개 / 전체: {len(policies)}개")

    if unmatched:
        print(f"\n--- 매칭 실패 정책명 ({len(unmatched)}개) ---")
        for name in unmatched:
            print(f"  · {name}")

    print(f"\n저장 완료: {OUT_PATH}")


if __name__ == "__main__":
    main()
