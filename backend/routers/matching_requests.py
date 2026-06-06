from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.user import User
from schemas.matching_request_schema import (
    MatchListResponse,
    MatchResponse,
    MatchingRequestCreateRequest,
    MatchingRequestListResponse,
    MatchingRequestResponse,
)
from services import matching_request_service


router = APIRouter()


@router.post(
    "/requests",
    response_model=MatchingRequestResponse,
    summary="친해져요 요청 보내기",
)
def create_matching_request(
    request: MatchingRequestCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_request_service.create_matching_request(
        db=db,
        current_user=current_user,
        request=request,
    )


@router.get(
    "/requests/received",
    response_model=MatchingRequestListResponse,
    summary="받은 친해져요 요청 목록 조회",
)
def get_received_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_request_service.get_received_requests(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/requests/sent",
    response_model=MatchingRequestListResponse,
    summary="보낸 친해져요 요청 목록 조회",
)
def get_sent_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_request_service.get_sent_requests(
        db=db,
        current_user=current_user,
    )


@router.post(
    "/requests/{request_id}/accept",
    response_model=MatchResponse,
    summary="친해져요 요청 수락 및 채팅방 생성",
)
def accept_matching_request(
    request_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_request_service.accept_matching_request(
        db=db,
        current_user=current_user,
        request_id=request_id,
    )


@router.post(
    "/requests/{request_id}/reject",
    response_model=MatchingRequestResponse,
    summary="친해져요 요청 거절",
)
def reject_matching_request(
    request_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_request_service.reject_matching_request(
        db=db,
        current_user=current_user,
        request_id=request_id,
    )


@router.delete(
    "/requests/{request_id}",
    response_model=MatchingRequestResponse,
    summary="보낸 친해져요 요청 취소",
)
def cancel_matching_request(
    request_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_request_service.cancel_matching_request(
        db=db,
        current_user=current_user,
        request_id=request_id,
    )


@router.get(
    "/matches",
    response_model=MatchListResponse,
    summary="매칭 완료된 육아친구 목록 조회",
)
def get_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return matching_request_service.get_matches(
        db=db,
        current_user=current_user,
    )