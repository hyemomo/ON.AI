import re

# ─── 패턴 상수 ───────────────────────────────────────────────────────────────
# 중간점 유니코드 변형 집합: · ‧ ⋅ ・ ･ ∙  + PDF가 쉼표+공백으로 표기하는 경우 포함
_MIDDLE_DOTS = r'(?:[·‧⋅・･∙,]\s?)'
# 불릿 기호: ● • ○
_BULLET_PAT  = r'[●•○]'
# 정책 본문 소제목 키워드
_SECTION_KW  = r'(?:지원\s{0,2}대상|지원\s{0,2}내용|신청\s{0,2}방법|신청\s{0,2}절차|지원\s{0,2}기준|신청\s{0,2}기관|접수\s{0,2}기관)'


# ─── POLICY_METADATA (76개) ──────────────────────────────────────────────────
POLICY_METADATA = {

    # ══════════════════════════════════════════
    # 01 임신·출산 (8개)
    # ══════════════════════════════════════════
    "임신·출산 진료비 지원": {
        "category": "임신출산",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현물",
        "application_place": "국민건강보험공단,복지로"
    },
    "산모건강관리": {
        "category": "임신출산",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "보건소"
    },
    "고위험 임산부 의료비 지원": {
        "category": "임신출산",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "보건소"
    },
    "산모·신생아 건강관리 지원": {
        "category": "임신출산",
        "family_type": "전체",
        "income_criteria": "중위소득150%이하",
        "support_type": "서비스",
        "application_place": "보건소"
    },
    "출산비용 지원": {
        "category": "임신출산",
        "family_type": "전체",
        "income_criteria": "기초생활수급자",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "생애 초기 건강관리사업": {
        "category": "임신출산",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "보건소"
    },
    "출산지원시설": {
        "category": "임신출산",
        "family_type": "미혼모부",
        "income_criteria": "소득무관",
        "support_type": "시설",
        "application_place": "해당시설,가족상담전화"
    },
    "첫만남이용권": {
        "category": "임신출산",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현물",
        "application_place": "읍면동행정복지센터,보건소"
    },

    # ══════════════════════════════════════════
    # 02 양육·돌봄 (25개)
    # ══════════════════════════════════════════
    "저소득 한부모가족 아동양육비": {
        "category": "양육돌봄",
        "family_type": "저소득한부모,조손가족",
        "income_criteria": "중위소득65%이하",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터,복지로"
    },
    "청소년한부모 아동양육비": {
        "category": "양육돌봄",
        "family_type": "청소년한부모",
        "income_criteria": "중위소득65%이하",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "긴급복지지원": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "중위소득75%이하",
        "support_type": "현금,현물,서비스",
        "application_place": "읍면동행정복지센터,보건복지상담센터"
    },
    "사회취약계층 환경성질환 예방": {
        "category": "양육돌봄",
        "family_type": "저소득한부모",
        "income_criteria": "중위소득65%이하",
        "support_type": "서비스",
        "application_place": "보건소"
    },
    "맞춤형 기초생활 보장": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "급여별기준이하",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "온가족보듬사업": {
        "category": "양육돌봄",
        "family_type": "저소득한부모,청소년한부모,조손가족",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "가족센터"
    },
    "미숙아 및 선천성이상아 의료비 지원": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "보건소"
    },
    "선천성 대사이상 검사 및 환아관리": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금,서비스",
        "application_place": "보건소"
    },
    "선천성 난청검사 및 보청기 지원": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금,현물",
        "application_place": "보건소"
    },
    "저소득층 기저귀·조제분유 지원": {
        "category": "양육돌봄",
        "family_type": "저소득한부모,조손가족",
        "income_criteria": "중위소득80%이하",
        "support_type": "현물",
        "application_place": "보건소,복지로"
    },
    "아동수당": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "유치원 유아학비 지원": {
        "category": "양육돌봄",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "현물",
        "application_place": "읍면동행정복지센터,교육부콜센터"
    },
    "보육료 지원": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현물",
        "application_place": "읍면동행정복지센터,복지로"
    },
    "가정양육수당 지원": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터,복지로"
    },
    "유아 무상교육·보육비 지원": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현물",
        "application_place": "교육부콜센터"
    },
    "부모급여": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터,복지로"
    },
    "드림스타트": {
        "category": "양육돌봄",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "드림스타트센터"
    },
    "아이돌봄서비스": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "가족센터,아이돌봄포털"
    },
    "지역아동센터 지원": {
        "category": "양육돌봄",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "지역아동센터"
    },
    "여성청소년 생리용품 바우처": {
        "category": "양육돌봄",
        "family_type": "저소득한부모",
        "income_criteria": "중위소득60%이하",
        "support_type": "현물",
        "application_place": "읍면동행정복지센터,복지로"
    },
    "가사·간병 방문 지원": {
        "category": "양육돌봄",
        "family_type": "저소득한부모",
        "income_criteria": "중위소득70%이하",
        "support_type": "서비스",
        "application_place": "읍면동행정복지센터"
    },
    "통합사례관리": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "읍면동행정복지센터"
    },
    "육아종합지원센터": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "육아종합지원센터"
    },
    "공동육아나눔터": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "가족센터"
    },
    "늘봄학교": {
        "category": "양육돌봄",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "초등학교"
    },

    # ══════════════════════════════════════════
    # 03 시설·주거 (4개)
    # ══════════════════════════════════════════
    "한부모가족 복지시설": {
        "category": "시설주거",
        "family_type": "저소득한부모,미혼모부,청소년한부모",
        "income_criteria": "소득무관",
        "support_type": "시설",
        "application_place": "해당시설,시군구"
    },
    "공동생활가정형 매입임대주택": {
        "category": "시설주거",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "시설",
        "application_place": "LH한국토지주택공사"
    },
    "공공주택 지원": {
        "category": "시설주거",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "시설",
        "application_place": "LH한국토지주택공사"
    },
    "주택자금대여 우대": {
        "category": "시설주거",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "대출",
        "application_place": "주택도시기금"
    },

    # ══════════════════════════════════════════
    # 04 교육·취업 (8개)
    # ══════════════════════════════════════════
    "위탁교육기관": {
        "category": "교육취업",
        "family_type": "청소년한부모",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "위탁교육기관"
    },
    "여성새로일하기센터": {
        "category": "교육취업",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "여성새로일하기센터"
    },
    "청소년 방과후 아카데미": {
        "category": "교육취업",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "청소년방과후아카데미"
    },
    "자녀 교육비 지원": {
        "category": "교육취업",
        "family_type": "저소득한부모,청소년한부모",
        "income_criteria": "중위소득65%이하",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "청소년치료재활센터": {
        "category": "교육취업",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "청소년치료재활센터"
    },
    "장학금 및 학자금 대출": {
        "category": "교육취업",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금,대출",
        "application_place": "한국장학재단"
    },
    "국민취업지원제도": {
        "category": "교육취업",
        "family_type": "전체",
        "income_criteria": "중위소득60%이하",
        "support_type": "현금,서비스",
        "application_place": "고용노동부,고용센터"
    },
    "한부모 근로자 육아휴직급여": {
        "category": "교육취업",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "고용노동부"
    },

    # ══════════════════════════════════════════
    # 05 금융·법률 (12개)
    # ══════════════════════════════════════════
    "양육비 이행지원 서비스": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "법률",
        "application_place": "양육비이행관리원"
    },
    "한부모가족 무료법률구조": {
        "category": "금융법률",
        "family_type": "저소득한부모",
        "income_criteria": "중위소득125%이하",
        "support_type": "법률",
        "application_place": "대한법률구조공단"
    },
    "근로장려금": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "국세청"
    },
    "자녀장려금": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "국세청"
    },
    "연말정산 소득공제": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "국세청,홈택스"
    },
    "미소금융": {
        "category": "금융법률",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "대출",
        "application_place": "미소금융중앙재단"
    },
    "소액보험": {
        "category": "금융법률",
        "family_type": "저소득한부모",
        "income_criteria": "중위소득65%이하",
        "support_type": "보험",
        "application_place": "읍면동행정복지센터"
    },
    "풍수해·지진보험": {
        "category": "금융법률",
        "family_type": "저소득한부모",
        "income_criteria": "기초생활수급자,차상위계층",
        "support_type": "보험",
        "application_place": "읍면동행정복지센터"
    },
    "아동발달지원계좌": {
        "category": "금융법률",
        "family_type": "저소득한부모",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "희망저축계좌Ⅰ": {
        "category": "금융법률",
        "family_type": "저소득한부모",
        "income_criteria": "생계의료급여수급자",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "희망저축계좌Ⅱ": {
        "category": "금융법률",
        "family_type": "저소득한부모",
        "income_criteria": "중위소득50%이하",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터"
    },
    "청년내일저축계좌": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "중위소득100%이하",
        "support_type": "현금",
        "application_place": "읍면동행정복지센터,복지로"
    },

    # ══════════════════════════════════════════
    # 06 기타 (19개)
    # ══════════════════════════════════════════
    # ══════════════════════════════════════════
    # 06 생활편의 (8개) — 구 기타에서 재분류
    # ══════════════════════════════════════════
    "요금감면 혜택": {
        "category": "생활편의",
        "family_type": "저소득한부모",
        "income_criteria": "기초생활수급자,차상위계층",
        "support_type": "현물",
        "application_place": "해당통신사,한국전력"
    },
    "저소득층 에너지효율개선": {
        "category": "생활편의",
        "family_type": "저소득한부모",
        "income_criteria": "기초생활수급자,차상위계층",
        "support_type": "현물",
        "application_place": "한국에너지공단"
    },
    "에너지바우처": {
        "category": "생활편의",
        "family_type": "저소득한부모",
        "income_criteria": "기초생활수급자",
        "support_type": "현물",
        "application_place": "읍면동행정복지센터"
    },
    "전기요금 복지할인 대상 고효율가전 구매지원": {
        "category": "생활편의",
        "family_type": "저소득한부모",
        "income_criteria": "기초생활수급자,차상위계층",
        "support_type": "현물",
        "application_place": "한국에너지공단"
    },
    "운전면허 무료교육": {
        "category": "생활편의",
        "family_type": "저소득한부모",
        "income_criteria": "중위소득65%이하",
        "support_type": "서비스",
        "application_place": "도로교통공단"
    },
    "스포츠 강좌 이용권": {
        "category": "생활편의",
        "family_type": "저소득한부모",
        "income_criteria": "기초생활수급자,차상위계층",
        "support_type": "현물",
        "application_place": "국민체육진흥공단"
    },
    "통합문화이용권": {
        "category": "생활편의",
        "family_type": "저소득한부모",
        "income_criteria": "기초생활수급자,차상위계층",
        "support_type": "현물",
        "application_place": "읍면동행정복지센터"
    },
    "4대궁·종묘·조선왕릉 무료입장": {
        "category": "생활편의",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "국가유산청"
    },
    # 출생 관련 → 양육돌봄 / 금융법률 재분류
    "미혼부 자녀 출생신고": {
        "category": "금융법률",
        "family_type": "미혼모부",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "가정법원"
    },
    "출생신고 완료전 미혼부 자녀 지원": {
        "category": "양육돌봄",
        "family_type": "미혼모부",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "읍면동행정복지센터,가정법원"
    },
    # 양육비 이행 관련 → 금융법률 재분류
    # (양육비 이행확보 지원 관련 용어 — 정보 안내 항목으로 제외)
    "양육비 이행확보 지원 서비스": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "법률",
        "application_place": "양육비이행관리원"
    },
    "법률지원": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "법률",
        "application_place": "양육비이행관리원,대한법률구조공단"
    },
    "제재조치": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "법률",
        "application_place": "양육비이행관리원"
    },
    "추심지원": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "법률",
        "application_place": "양육비이행관리원"
    },
    "상담지원": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "양육비이행관리원,가족상담전화"
    },
    "모니터링": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "양육비이행관리원"
    },
    "면접교섭 서비스": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "서비스",
        "application_place": "양육비이행관리원,가족센터"
    },
    "양육비 선지급제": {
        "category": "금융법률",
        "family_type": "전체",
        "income_criteria": "소득무관",
        "support_type": "현금",
        "application_place": "양육비이행관리원"
    },
}

# 정책명이 페이지 제목에 그대로 등장하지 않는 특수 케이스
SPECIAL_PAGE_PATTERNS = {
    "출생신고 완료전이라도": "출생신고 완료전 미혼부 자녀 지원",
    "양육비 이행확보를 위한 다양한 서비스를 제공합니다": "양육비 이행확보 지원 서비스",
    "양육비 이행확보 지원 관련 용어를 알아보아요": "양육비 이행확보 지원 관련 용어",
    # JSON API가 로마숫자를 ASCII I/II로 출력 (p41)
    "희망저축계좌 I": "희망저축계좌Ⅰ",
    "희망저축계좌 II": "희망저축계좌Ⅱ",
}


# ─── 헬퍼 함수 ───────────────────────────────────────────────────────────────

def _make_policy_pattern(policy_name):
    """정책명 뒤 600자 이내에 불릿(●•○) 또는 소제목 키워드가 있으면 본문으로 인식.
    기존 200자 + ● 만 보던 방식에서 확장 — 누락 9개 수정."""
    p = re.escape(policy_name)
    p = p.replace('·', _MIDDLE_DOTS)
    p += r'.{0,600}(?:' + _BULLET_PAT + '|' + _SECTION_KW + ')'
    return p


def _find_policy_heading(policy_name, text):
    """전체 텍스트에서 정책 본문 시작 위치 반환. 없으면 -1."""
    p = re.escape(policy_name).replace('·', _MIDDLE_DOTS)
    best_pos, best_score = -1, float('-inf')

    for m in re.finditer(p, text):
        pos = m.start()
        window = text[m.end(): m.end() + 600]

        # 키워드·불릿 밀도 점수
        score = sum(window.count(kw) * 3 for kw in ["지원", "신청", "대상", "방법", "내용"])
        score += window.count('●') * 5 + window.count('○') * 3 + window.count('•') * 2

        # 정책명 직후 2-3자리 숫자 → TOC 페이지번호 → 강력 감점
        after = text[m.end(): m.end() + 8].strip()
        if re.match(r'^\d{2,3}(\s|$)', after):
            score -= 50

        # 줄 중간 출현 → 제목이 아닐 가능성 → 감점
        if pos > 0 and text[pos - 1] != '\n':
            score -= 30

        # 직전 연결어: 한글 목록 중간 등장 → 감점
        # URL의 ")"는 제외 (직전 문자가 ASCII이면 URL 컨텍스트)
        before = text[max(0, pos - 15): pos].strip()
        if before:
            last = before[-1]
            if last in ('및', '등', '·', ','):
                score -= 20
            elif last == ')':
                # URL 내 ) 는 패널티 없음 (직전이 ASCII 문자)
                if len(before) >= 2 and not ('가' <= before[-2] <= '힣'):
                    pass  # URL context, no penalty
                else:
                    score -= 20

        # 바로 다음에 불릿이 오면 독립 제목 → 강력 보너스
        if re.match(r'\s{0,3}[●•○]', window[:15]):
            score += 50

        if score > best_score:
            best_score, best_pos = score, pos

    return best_pos


def _get_page_num(pos, page_boundaries):
    result = page_boundaries[0][0]
    for page_num, boundary_pos in page_boundaries:
        if boundary_pos <= pos:
            result = page_num
        else:
            break
    return result


def build_chunks(full_text, page_boundaries):
    """전체 텍스트와 페이지 경계 정보로부터 정책별 청크 리스트를 생성."""
    policy_positions = []
    for policy_name in POLICY_METADATA:
        pos = _find_policy_heading(policy_name, full_text)
        if pos >= 0:
            policy_positions.append((pos, policy_name))

    found_names = {pn for _, pn in policy_positions}
    for pattern_text, policy_name in SPECIAL_PAGE_PATTERNS.items():
        if policy_name not in found_names:
            pos = full_text.find(pattern_text)
            if pos >= 0:
                policy_positions.append((pos, policy_name))

    policy_positions.sort(key=lambda x: x[0])

    chunks = []
    for i, (start_pos, policy_name) in enumerate(policy_positions):
        end_pos = policy_positions[i + 1][0] if i + 1 < len(policy_positions) else len(full_text)
        chunk_text = full_text[start_pos:end_pos].strip()
        page_num = _get_page_num(start_pos, page_boundaries)
        meta = POLICY_METADATA[policy_name]
        chunks.append({
            "text": chunk_text,
            "metadata": {
                "source": "종합안내서",
                "page": page_num,
                "chunk_type": "policy",
                "category": meta["category"],
                "policy_name": policy_name,
                "family_type": meta["family_type"],
                "income_criteria": meta["income_criteria"],
                "support_type": meta["support_type"],
                "application_place": meta["application_place"],
            }
        })

    missing = [pn for pn in POLICY_METADATA if pn not in {pn for _, pn in policy_positions}]
    if missing:
        print(f"[경고] 위치를 찾지 못한 정책 {len(missing)}개: {missing}")

    return chunks
