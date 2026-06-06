from __future__ import annotations

from datetime import date
from functools import lru_cache
from math import sqrt

from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from models.child import Child
from models.user import User
from schemas.matching_schema import (
    MatchingRecommendationListResponse,
    MatchingRecommendationResponse,
    MatchingScoreDetail,
    MatchingUserSummary,
)


# 한국어 문장 임베딩 모델입니다.
# 회원가입 시 선택한 MBTI, 사는 지역, 관심지역, 관심사, 자녀 정보를 문장으로 변환한 뒤
# 실제 AI 임베딩 모델이 두 사용자의 의미적 유사도를 계산합니다.
DEFAULT_EMBEDDING_MODEL_NAME = "jhgan/ko-sroberta-multitask"


MBTI_DESCRIPTIONS = {
    "ISTJ": "현실적이고 책임감이 강하며 규칙과 안정적인 생활을 중시하는 보호자 성향",
    "ISFJ": "배려심이 깊고 세심하며 가족과 주변 사람을 안정적으로 돌보는 보호자 성향",
    "INFJ": "공감 능력이 높고 의미 있는 관계와 깊은 대화를 선호하는 보호자 성향",
    "INTJ": "계획적이고 독립적이며 장기적인 방향성과 문제 해결을 중시하는 보호자 성향",
    "ISTP": "실용적이고 침착하며 필요한 순간에 빠르게 문제를 해결하는 보호자 성향",
    "ISFP": "온화하고 감성적이며 아이의 개성과 정서를 존중하는 보호자 성향",
    "INFP": "이상과 가치관을 중요하게 여기며 아이의 감정과 마음을 섬세하게 살피는 보호자 성향",
    "INTP": "분석적이고 호기심이 많으며 새로운 육아 정보를 탐색하고 이해하려는 보호자 성향",
    "ESTP": "활동적이고 현실 감각이 좋으며 아이와 직접 경험하며 배우는 것을 선호하는 보호자 성향",
    "ESFP": "밝고 사교적이며 아이와 즐거운 경험과 놀이를 나누는 것을 좋아하는 보호자 성향",
    "ENFP": "열정적이고 상상력이 풍부하며 새로운 사람과 육아 경험을 나누는 것을 좋아하는 보호자 성향",
    "ENTP": "유연하고 아이디어가 많으며 다양한 육아 방식과 대화를 즐기는 보호자 성향",
    "ESTJ": "체계적이고 책임감이 강하며 일정과 규칙을 중요하게 생각하는 보호자 성향",
    "ESFJ": "친화적이고 배려심이 많으며 공동체와 관계 속에서 육아 정보를 나누는 보호자 성향",
    "ENFJ": "공감과 소통을 잘하고 주변 사람을 격려하며 함께 성장하는 관계를 선호하는 보호자 성향",
    "ENTJ": "목표 지향적이고 추진력이 있으며 효율적인 육아 계획과 실행을 중시하는 보호자 성향",
}


@lru_cache(maxsize=1)
def get_embedding_model():
    """문장 임베딩 모델을 1번만 로드합니다."""
    try:
        from sentence_transformers import SentenceTransformer
    except Exception as exc:
        raise RuntimeError(
            f"AI 임베딩 모델 로딩 실패: {type(exc).__name__}: {exc}"
        ) from exc

    return SentenceTransformer(DEFAULT_EMBEDDING_MODEL_NAME)


def calculate_cosine_similarity(vector_a, vector_b) -> float:
    dot_product = sum(float(a) * float(b) for a, b in zip(vector_a, vector_b))
    norm_a = sqrt(sum(float(a) * float(a) for a in vector_a))
    norm_b = sqrt(sum(float(b) * float(b) for b in vector_b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot_product / (norm_a * norm_b)


def cosine_to_score(cosine_similarity: float) -> int:
    return round(max(0.0, min(1.0, cosine_similarity)) * 100)


def normalize_mbti(mbti: str | None) -> str | None:
    if mbti is None:
        return None

    normalized = mbti.strip().upper()
    if normalized not in MBTI_DESCRIPTIONS:
        return None

    return normalized


def get_mbti_description(mbti: str | None) -> str:
    normalized = normalize_mbti(mbti)
    if normalized is None:
        return "MBTI 정보가 등록되지 않은 보호자"

    return f"{normalized} 유형이며 {MBTI_DESCRIPTIONS[normalized]}"


def get_user_interests(user: User) -> list[str]:
    return [interest.interest_name for interest in user.interests]


def get_user_interest_regions(user: User) -> list[str]:
    return [region.region_name for region in user.interest_regions]


def get_region_province(region: str | None) -> str:
    if not region:
        return ""

    return region.split()[0]


def calculate_region_score(my_region: str, other_region: str) -> int:
    # 지역은 임베딩보다 명확한 행정구역 일치 여부가 중요해서 구조화 점수로 계산합니다.
    if my_region == other_region:
        return 100

    if get_region_province(my_region) == get_region_province(other_region):
        return 70

    return 20


def calculate_age_months(child_birth: date) -> int:
    today = date.today()
    return (today.year - child_birth.year) * 12 + (today.month - child_birth.month)


def get_children_age_months(children: list[Child]) -> list[int]:
    return [calculate_age_months(child.child_birth) for child in children]


def calculate_child_age_score(my_children: list[Child], other_children: list[Child]) -> int:
    # 자녀 나이대도 실제 개월 수 차이가 중요해서 구조화 점수로 계산합니다.
    my_ages = get_children_age_months(my_children)
    other_ages = get_children_age_months(other_children)

    if not my_ages and not other_ages:
        return 50

    if not my_ages or not other_ages:
        return 20

    best_score = 0

    for my_age in my_ages:
        for other_age in other_ages:
            gap = abs(my_age - other_age)

            if gap <= 6:
                score = 100
            elif gap <= 12:
                score = 85
            elif gap <= 24:
                score = 65
            elif gap <= 36:
                score = 45
            else:
                score = 25

            best_score = max(best_score, score)

    return best_score


def join_values(values: list[str], empty_text: str) -> str:
    return ", ".join(values) if values else empty_text


def build_mbti_text(user: User) -> str:
    return f"보호자 성향 정보: {get_mbti_description(user.parents_mbti)}"


def build_interest_regions_text(user: User) -> str:
    interest_regions = get_user_interest_regions(user)
    return f"관심지역 정보: {join_values(interest_regions, '등록된 관심지역 없음')}"


def build_interests_text(user: User) -> str:
    interests = get_user_interests(user)
    return f"육아 관심사 정보: {join_values(interests, '등록된 관심사 없음')}"


def build_children_text(user: User) -> str:
    children_ages = get_children_age_months(user.children)

    if children_ages:
        children_text = ", ".join([f"{age}개월 자녀" for age in children_ages])
    else:
        children_text = "등록된 자녀 정보 없음"

    return f"자녀 나이대 정보: {children_text}"


def build_ai_profile_text(user: User) -> str:
    # 이 문장이 실제 AI 임베딩 모델에 들어가는 통합 프로필입니다.
    # MBTI만 따로 보는 기능이 아니라, MBTI·사는지역·관심지역·관심사·자녀 나이대를 한 번에 묶어서 분석합니다.
    return (
        f"이 사용자는 {user.region}에 거주하는 보호자입니다. "
        f"{build_mbti_text(user)} "
        f"{build_interest_regions_text(user)} "
        f"{build_interests_text(user)} "
        f"{build_children_text(user)} "
        "이 정보는 비슷한 육아 환경, 비슷한 관심사, 대화 성향, 지역 기반 만남 가능성을 고려해 "
        "육아친구 추천을 하기 위한 AI 매칭 프로필입니다."
    )


def calculate_ai_scores(my_user: User, other_user: User) -> dict[str, int]:
    # 같은 모델을 사용해 전체 프로필과 주요 항목별 의미 유사도를 계산합니다.
    # 단독 MBTI 분석 API는 없고, 이 점수들은 추천 점수 내부에서만 사용됩니다.
    pairs = [
        (build_ai_profile_text(my_user), build_ai_profile_text(other_user)),
        (build_mbti_text(my_user), build_mbti_text(other_user)),
        (build_interest_regions_text(my_user), build_interest_regions_text(other_user)),
        (build_interests_text(my_user), build_interests_text(other_user)),
    ]

    texts: list[str] = []
    for text_a, text_b in pairs:
        texts.append(text_a)
        texts.append(text_b)

    model = get_embedding_model()
    embeddings = model.encode(texts, normalize_embeddings=True)

    return {
        "overall_ai_similarity_score": cosine_to_score(calculate_cosine_similarity(embeddings[0], embeddings[1])),
        "mbti_ai_score": cosine_to_score(calculate_cosine_similarity(embeddings[2], embeddings[3])),
        "interest_region_ai_score": cosine_to_score(calculate_cosine_similarity(embeddings[4], embeddings[5])),
        "interest_ai_score": cosine_to_score(calculate_cosine_similarity(embeddings[6], embeddings[7])),
    }


def calculate_final_score(
    overall_ai_similarity_score: int,
    mbti_ai_score: int,
    region_score: int,
    interest_region_ai_score: int,
    interest_ai_score: int,
    child_age_score: int,
) -> int:
    # 핵심은 AI 임베딩 기반 통합 유사도입니다.
    # 지역과 자녀 나이대처럼 숫자/행정구역으로 명확한 정보는 보조 점수로 함께 반영합니다.
    final_score = (
        overall_ai_similarity_score * 0.50
        + mbti_ai_score * 0.10
        + region_score * 0.12
        + interest_region_ai_score * 0.10
        + interest_ai_score * 0.13
        + child_age_score * 0.05
    )

    return round(final_score)


def create_ai_reason(
    score_detail: MatchingScoreDetail,
    common_interests: list[str],
    common_interest_regions: list[str],
) -> str:
    reasons = []

    if score_detail.overall_ai_similarity_score >= 80:
        reasons.append("AI가 MBTI, 지역, 관심지역, 관심사, 자녀 정보를 함께 분석한 결과 전체 육아 프로필 유사도가 높게 나타났습니다")
    elif score_detail.overall_ai_similarity_score >= 65:
        reasons.append("AI가 종합 분석한 결과 육아 환경과 관심사에서 공통점이 어느 정도 확인되었습니다")
    else:
        reasons.append("AI 종합 분석에서는 일부 항목에서만 유사성이 확인되었습니다")

    if score_detail.mbti_ai_score >= 75:
        reasons.append("보호자 성향 정보도 비교적 비슷하게 분석되었습니다")

    if score_detail.region_score == 100:
        reasons.append("같은 지역에 거주해 실제 만남이나 지역 정보 공유로 이어지기 쉽습니다")
    elif score_detail.region_score >= 70:
        reasons.append("같은 시·도 권역에 있어 지역 기반 공감대가 생기기 쉽습니다")

    if score_detail.interest_region_ai_score >= 75:
        reasons.append("관심지역의 방향성이 비슷하게 분석되었습니다")

    if score_detail.interest_ai_score >= 75:
        reasons.append("육아 관심사의 의미적 유사도가 높게 분석되었습니다")

    if common_interests:
        reasons.append(f"공통 관심사는 {', '.join(common_interests[:3])}입니다")

    if common_interest_regions:
        reasons.append(f"공통 관심지역은 {', '.join(common_interest_regions[:3])}입니다")

    if score_detail.child_age_score >= 85:
        reasons.append("자녀 나이대가 비슷해 육아 고민과 생활 패턴을 공유하기 좋습니다")

    return " · ".join(reasons)


def get_recommendations(
    db: Session,
    current_user: User,
    limit: int = 10,
) -> MatchingRecommendationListResponse:
    if limit < 1 or limit > 50:
        raise HTTPException(status_code=400, detail="limit은 1 이상 50 이하로 입력해 주세요.")

    my_user = (
        db.query(User)
        .options(
            selectinload(User.children),
            selectinload(User.interest_regions),
            selectinload(User.interests),
        )
        .filter(User.usernum == current_user.usernum)
        .first()
    )

    if my_user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    candidates = (
        db.query(User)
        .options(
            selectinload(User.children),
            selectinload(User.interest_regions),
            selectinload(User.interests),
        )
        .filter(User.usernum != current_user.usernum)
        .all()
    )

    recommendations: list[MatchingRecommendationResponse] = []

    my_interests = get_user_interests(my_user)
    my_interest_regions = get_user_interest_regions(my_user)

    for candidate in candidates:
        candidate_interests = get_user_interests(candidate)
        candidate_interest_regions = get_user_interest_regions(candidate)

        ai_scores = calculate_ai_scores(my_user, candidate)
        region_score = calculate_region_score(my_user.region, candidate.region)
        child_age_score = calculate_child_age_score(my_user.children, candidate.children)

        final_score = calculate_final_score(
            overall_ai_similarity_score=ai_scores["overall_ai_similarity_score"],
            mbti_ai_score=ai_scores["mbti_ai_score"],
            region_score=region_score,
            interest_region_ai_score=ai_scores["interest_region_ai_score"],
            interest_ai_score=ai_scores["interest_ai_score"],
            child_age_score=child_age_score,
        )

        common_interests = sorted(list(set(my_interests) & set(candidate_interests)))
        common_interest_regions = sorted(list(set(my_interest_regions) & set(candidate_interest_regions)))

        score_detail = MatchingScoreDetail(
            overall_ai_similarity_score=ai_scores["overall_ai_similarity_score"],
            mbti_ai_score=ai_scores["mbti_ai_score"],
            region_score=region_score,
            interest_region_ai_score=ai_scores["interest_region_ai_score"],
            interest_ai_score=ai_scores["interest_ai_score"],
            child_age_score=child_age_score,
        )

        recommendations.append(
            MatchingRecommendationResponse(
                user=MatchingUserSummary(
                    usernum=candidate.usernum,
                    nickname=candidate.nickname,
                    parents_mbti=candidate.parents_mbti,
                    region=candidate.region,
                ),
                match_score=final_score,
                score_detail=score_detail,
                common_interests=common_interests,
                common_interest_regions=common_interest_regions,
                ai_reason=create_ai_reason(
                    score_detail=score_detail,
                    common_interests=common_interests,
                    common_interest_regions=common_interest_regions,
                ),
            )
        )

    recommendations.sort(key=lambda item: item.match_score, reverse=True)
    recommendations = recommendations[:limit]

    return MatchingRecommendationListResponse(
        message="AI가 MBTI, 사는지역, 관심지역, 관심사, 자녀 정보를 종합 분석한 육아친구 추천 목록입니다.",
        total=len(recommendations),
        recommendations=recommendations,
    )