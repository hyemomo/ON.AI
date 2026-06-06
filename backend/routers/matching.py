from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.user import User
from schemas.matching_schema import MatchingRecommendationListResponse
from services import matching_service


router = APIRouter()


@router.get(
    "/recommendations",
    response_model=MatchingRecommendationListResponse,
    summary="AI 육아친구 추천 목록 조회",
)
def get_matching_recommendations(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_service.get_recommendations(
        db=db,
        current_user=current_user,
        limit=limit,
    )