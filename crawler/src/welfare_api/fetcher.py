"""
중앙부처 복지서비스 API에서 한부모·조손 관련 서비스를 수집하고
welfare_services.json으로 저장한다.

실행:
    cd crawler
    python src/welfare_api/fetcher.py
"""

import json
import time
import xml.etree.ElementTree as ET
from urllib.parse import urlencode
from urllib.request import urlopen

from config import (
    API_KEY, LIST_URL, DETAIL_URL,
    OUT_DIR, OUT_JSON, TARGET_CODES, LIFE_CODES,
)


def fetch_list(trgter_code: str, life_code: str, page: int = 1, num: int = 500) -> dict:
    params = {
        "serviceKey": API_KEY,
        "callTp": "L",
        "pageNo": str(page),
        "numOfRows": str(num),
        "srchKeyCode": "003",
        "trgterIndvdlArray": trgter_code,
        "lifeArray": life_code,
        "orderBy": "popular",
    }
    url = LIST_URL + "?" + urlencode(params)
    with urlopen(url, timeout=10) as res:
        return ET.fromstring(res.read())


def fetch_detail(serv_id: str) -> dict | None:
    params = {
        "serviceKey": API_KEY,
        "callTp": "D",
        "servId": serv_id,
    }
    url = DETAIL_URL + "?" + urlencode(params)
    try:
        with urlopen(url, timeout=10) as res:
            return ET.fromstring(res.read())
    except Exception as e:
        print(f"    [ERROR] {serv_id}: {e}")
        return None


def text(el, tag: str) -> str:
    node = el.find(tag)
    return (node.text or "").strip() if node is not None else ""


def parse_list(root) -> list[dict]:
    services = []
    for serv in root.findall(".//servList"):
        services.append({
            "serv_id":   text(serv, "servId"),
            "serv_nm":   text(serv, "servNm"),
            "ministry":  text(serv, "jurMnofNm"),
            "summary":   text(serv, "servDgst"),
            "detail_url": text(serv, "servDtlLink"),
            "life":      text(serv, "lifeArray"),
            "theme":     text(serv, "intrsThemaArray"),
            "target":    text(serv, "trgterIndvdlArray"),
            "contact":   text(serv, "rprsCtadr"),
            "online_apply": text(serv, "onapPsbltYn"),
        })
    return services


def parse_detail(root) -> dict:
    dtl = root.find("wantedDtl") or root

    # 신청방법
    apply_methods = []
    for item in root.findall(".//applmetList"):
        nm   = text(item, "servSeDetailNm")
        link = text(item, "servSeDetailLink")
        if nm or link:
            apply_methods.append({"name": nm, "detail": link})

    # 문의처
    contacts = []
    for item in root.findall(".//inqplCtadrList"):
        nm   = text(item, "servSeDetailNm")
        link = text(item, "servSeDetailLink")
        if nm or link:
            contacts.append({"name": nm, "contact": link})

    # 관련 사이트
    sites = []
    for item in root.findall(".//inqplHmpgReldList"):
        nm   = text(item, "servSeDetailNm")
        link = text(item, "servSeDetailLink")
        if nm or link:
            sites.append({"name": nm, "url": link})

    # 서식/자료
    forms = []
    for item in root.findall(".//basfrmList"):
        nm   = text(item, "servSeDetailNm")
        link = text(item, "servSeDetailLink")
        if nm or link:
            forms.append({"name": nm, "url": link})

    # 근거법령
    laws = []
    for item in root.findall(".//baslawList"):
        nm = text(item, "servSeDetailNm")
        if nm:
            laws.append(nm)

    return {
        "target_detail":    text(dtl, "tgtrDtlCn"),
        "select_criteria":  text(dtl, "slctCritCn"),
        "benefit_content":  text(dtl, "alwServCn"),
        "support_cycle":    text(dtl, "sprtCycNm"),
        "provide_type":     text(dtl, "srvPvsnNm"),
        "apply_methods":    apply_methods,
        "contacts":         contacts,
        "related_sites":    sites,
        "forms":            forms,
        "laws":             laws,
    }


def collect_ids() -> dict[str, dict]:
    """목록 조회로 서비스 기본 정보 수집 (중복 제거)"""
    services: dict[str, dict] = {}

    for trgter in TARGET_CODES:
        for life in LIFE_CODES:
            print(f"  목록 조회: 가구유형={trgter}, 생애주기={life}", end=" ... ")
            try:
                root = fetch_list(trgter, life)
                items = parse_list(root)
                for item in items:
                    sid = item["serv_id"]
                    if sid and sid not in services:
                        services[sid] = item
                print(f"{len(items)}건")
            except Exception as e:
                print(f"ERROR: {e}")
            time.sleep(0.3)

    return services


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=== 1단계: 목록 조회 ===")
    services = collect_ids()
    print(f"\n수집된 고유 서비스: {len(services)}개\n")

    print("=== 2단계: 상세 조회 ===")
    results = []
    for i, (serv_id, base) in enumerate(services.items(), 1):
        print(f"  [{i}/{len(services)}] {base['serv_nm']}")
        root = fetch_detail(serv_id)
        if root is not None:
            detail = parse_detail(root)
            results.append({**base, **detail})
        else:
            results.append(base)
        time.sleep(0.3)

    OUT_JSON.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n저장 완료: {OUT_JSON}")
    print(f"총 {len(results)}개 서비스")


if __name__ == "__main__":
    main()
