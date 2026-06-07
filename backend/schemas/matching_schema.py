from pydantic import BaseModel, Field


class MatchingUserSummary(BaseModel):
    usernum: int
    nickname: str
    parents_mbti: str | None = None
    region: str


class MatchingScoreDetail(BaseModel):
    overall_ai_similarity_score: int = Field(..., ge=0, le=100)
    mbti_ai_score: int = Field(..., ge=0, le=100)
    region_score: int = Field(..., ge=0, le=100)
    interest_region_ai_score: int = Field(..., ge=0, le=100)
    interest_ai_score: int = Field(..., ge=0, le=100)
    child_age_score: int = Field(..., ge=0, le=100)


class MatchingRecommendationResponse(BaseModel):
    user: MatchingUserSummary
    match_score: int = Field(..., ge=0, le=100)
    score_detail: MatchingScoreDetail
    common_interests: list[str]
    common_interest_regions: list[str]
    ai_reason: str


class MatchingRecommendationListResponse(BaseModel):
    message: str
    total: int
    recommendations: list[MatchingRecommendationResponse]