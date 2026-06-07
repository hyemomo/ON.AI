from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload

from models.chat_room import ChatRoom
from models.match import Match
from models.matching_request import MatchingRequest
from models.user import User
from schemas.matching_request_schema import (
    MatchListResponse,
    MatchResponse,
    MatchingRequestCreateRequest,
    MatchingRequestListResponse,
    MatchingRequestResponse,
    MatchingUserSimpleResponse,
)


PENDING = "PENDING"
ACCEPTED = "ACCEPTED"
REJECTED = "REJECTED"
CANCELED = "CANCELED"


REQUEST_STATUS_LABEL = {
    PENDING: "요청 대기중",
    ACCEPTED: "수락됨",
    REJECTED: "거절됨",
    CANCELED: "취소됨",
}


def normalize_user_pair(user_a: int, user_b: int) -> tuple[int, int]:
    return (user_a, user_b) if user_a < user_b else (user_b, user_a)


def build_user_simple_response(user: User) -> MatchingUserSimpleResponse:
    return MatchingUserSimpleResponse(
        usernum=user.usernum,
        nickname=user.nickname,
        parents_mbti=user.parents_mbti,
        region=user.region,
    )


def build_request_response(request: MatchingRequest) -> MatchingRequestResponse:
    return MatchingRequestResponse(
        request_id=request.request_id,
        requester=build_user_simple_response(request.requester),
        receiver=build_user_simple_response(request.receiver),
        status=request.status,
        message=request.message,
        created_at=request.created_at,
        responded_at=request.responded_at,
    )


def get_user_or_404(db: Session, usernum: int) -> User:
    user = db.query(User).filter(User.usernum == usernum).first()

    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return user


def get_existing_request_between_users(
    db: Session,
    user_a: int,
    user_b: int,
) -> MatchingRequest | None:
    return (
        db.query(MatchingRequest)
        .filter(
            or_(
                and_(
                    MatchingRequest.requester_usernum == user_a,
                    MatchingRequest.receiver_usernum == user_b,
                ),
                and_(
                    MatchingRequest.requester_usernum == user_b,
                    MatchingRequest.receiver_usernum == user_a,
                ),
            )
        )
        .first()
    )


def get_existing_match_between_users(
    db: Session,
    user_a: int,
    user_b: int,
) -> Match | None:
    user1, user2 = normalize_user_pair(user_a, user_b)

    return (
        db.query(Match)
        .filter(
            Match.user1_usernum == user1,
            Match.user2_usernum == user2,
        )
        .first()
    )


def create_matching_request(
    db: Session,
    current_user: User,
    request: MatchingRequestCreateRequest,
) -> MatchingRequestResponse:
    if current_user.usernum == request.receiver_usernum:
        raise HTTPException(status_code=400, detail="자기 자신에게는 친해져요 요청을 보낼 수 없습니다.")

    receiver = get_user_or_404(db, request.receiver_usernum)

    existing_match = get_existing_match_between_users(
        db=db,
        user_a=current_user.usernum,
        user_b=receiver.usernum,
    )

    if existing_match is not None:
        raise HTTPException(status_code=400, detail="이미 매칭된 사용자입니다.")

    existing_request = get_existing_request_between_users(
        db=db,
        user_a=current_user.usernum,
        user_b=receiver.usernum,
    )

    if existing_request is not None:
        if existing_request.status == PENDING:
            raise HTTPException(status_code=400, detail="이미 대기 중인 친해져요 요청이 있습니다.")

        if existing_request.status == ACCEPTED:
            raise HTTPException(status_code=400, detail="이미 수락된 요청입니다.")

        # 이전 요청이 거절/취소 상태라면 같은 행을 재사용해 다시 요청할 수 있게 합니다.
        existing_request.requester_usernum = current_user.usernum
        existing_request.receiver_usernum = receiver.usernum
        existing_request.status = PENDING
        existing_request.message = request.message
        existing_request.created_at = datetime.now()
        existing_request.responded_at = None

        db.commit()
        db.refresh(existing_request)

        refreshed_request = (
            db.query(MatchingRequest)
            .options(
                joinedload(MatchingRequest.requester),
                joinedload(MatchingRequest.receiver),
            )
            .filter(MatchingRequest.request_id == existing_request.request_id)
            .first()
        )
        return build_request_response(refreshed_request)

    new_request = MatchingRequest(
        requester_usernum=current_user.usernum,
        receiver_usernum=receiver.usernum,
        status=PENDING,
        message=request.message,
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    created_request = (
        db.query(MatchingRequest)
        .options(
            joinedload(MatchingRequest.requester),
            joinedload(MatchingRequest.receiver),
        )
        .filter(MatchingRequest.request_id == new_request.request_id)
        .first()
    )

    return build_request_response(created_request)


def get_received_requests(
    db: Session,
    current_user: User,
) -> MatchingRequestListResponse:
    requests = (
        db.query(MatchingRequest)
        .options(
            joinedload(MatchingRequest.requester),
            joinedload(MatchingRequest.receiver),
        )
        .filter(
            MatchingRequest.receiver_usernum == current_user.usernum,
            MatchingRequest.status == PENDING,
        )
        .order_by(MatchingRequest.created_at.desc())
        .all()
    )

    return MatchingRequestListResponse(
        message="받은 친해져요 요청 목록입니다.",
        total=len(requests),
        requests=[build_request_response(item) for item in requests],
    )


def get_sent_requests(
    db: Session,
    current_user: User,
) -> MatchingRequestListResponse:
    requests = (
        db.query(MatchingRequest)
        .options(
            joinedload(MatchingRequest.requester),
            joinedload(MatchingRequest.receiver),
        )
        .filter(MatchingRequest.requester_usernum == current_user.usernum)
        .order_by(MatchingRequest.created_at.desc())
        .all()
    )

    return MatchingRequestListResponse(
        message="보낸 친해져요 요청 목록입니다.",
        total=len(requests),
        requests=[build_request_response(item) for item in requests],
    )


def accept_matching_request(
    db: Session,
    current_user: User,
    request_id: int,
) -> MatchResponse:
    matching_request = (
        db.query(MatchingRequest)
        .options(
            joinedload(MatchingRequest.requester),
            joinedload(MatchingRequest.receiver),
        )
        .filter(MatchingRequest.request_id == request_id)
        .first()
    )

    if matching_request is None:
        raise HTTPException(status_code=404, detail="친해져요 요청을 찾을 수 없습니다.")

    if matching_request.receiver_usernum != current_user.usernum:
        raise HTTPException(status_code=403, detail="이 요청을 수락할 권한이 없습니다.")

    if matching_request.status != PENDING:
        raise HTTPException(status_code=400, detail="대기 중인 요청만 수락할 수 있습니다.")

    existing_match = get_existing_match_between_users(
        db=db,
        user_a=matching_request.requester_usernum,
        user_b=matching_request.receiver_usernum,
    )

    if existing_match is not None:
        raise HTTPException(status_code=400, detail="이미 매칭된 사용자입니다.")

    user1_usernum, user2_usernum = normalize_user_pair(
        matching_request.requester_usernum,
        matching_request.receiver_usernum,
    )

    matching_request.status = ACCEPTED
    matching_request.responded_at = datetime.now()

    new_match = Match(
        user1_usernum=user1_usernum,
        user2_usernum=user2_usernum,
        matching_request_id=matching_request.request_id,
    )

    db.add(new_match)
    db.flush()

    new_chat_room = ChatRoom(match_id=new_match.match_id)
    db.add(new_chat_room)

    db.commit()
    db.refresh(new_match)
    db.refresh(new_chat_room)

    other_user = matching_request.requester

    return MatchResponse(
        match_id=new_match.match_id,
        matched_user=build_user_simple_response(other_user),
        chat_room_id=new_chat_room.room_id,
        created_at=new_match.created_at,
    )


def reject_matching_request(
    db: Session,
    current_user: User,
    request_id: int,
) -> MatchingRequestResponse:
    matching_request = (
        db.query(MatchingRequest)
        .options(
            joinedload(MatchingRequest.requester),
            joinedload(MatchingRequest.receiver),
        )
        .filter(MatchingRequest.request_id == request_id)
        .first()
    )

    if matching_request is None:
        raise HTTPException(status_code=404, detail="친해져요 요청을 찾을 수 없습니다.")

    if matching_request.receiver_usernum != current_user.usernum:
        raise HTTPException(status_code=403, detail="이 요청을 거절할 권한이 없습니다.")

    if matching_request.status != PENDING:
        raise HTTPException(status_code=400, detail="대기 중인 요청만 거절할 수 있습니다.")

    matching_request.status = REJECTED
    matching_request.responded_at = datetime.now()

    db.commit()
    db.refresh(matching_request)

    return build_request_response(matching_request)


def cancel_matching_request(
    db: Session,
    current_user: User,
    request_id: int,
) -> MatchingRequestResponse:
    matching_request = (
        db.query(MatchingRequest)
        .options(
            joinedload(MatchingRequest.requester),
            joinedload(MatchingRequest.receiver),
        )
        .filter(MatchingRequest.request_id == request_id)
        .first()
    )

    if matching_request is None:
        raise HTTPException(status_code=404, detail="친해져요 요청을 찾을 수 없습니다.")

    if matching_request.requester_usernum != current_user.usernum:
        raise HTTPException(status_code=403, detail="이 요청을 취소할 권한이 없습니다.")

    if matching_request.status != PENDING:
        raise HTTPException(status_code=400, detail="대기 중인 요청만 취소할 수 있습니다.")

    matching_request.status = CANCELED
    matching_request.responded_at = datetime.now()

    db.commit()
    db.refresh(matching_request)

    return build_request_response(matching_request)


def get_matches(
    db: Session,
    current_user: User,
) -> MatchListResponse:
    matches = (
        db.query(Match)
        .options(
            joinedload(Match.user1),
            joinedload(Match.user2),
            joinedload(Match.chat_room),
        )
        .filter(
            or_(
                Match.user1_usernum == current_user.usernum,
                Match.user2_usernum == current_user.usernum,
            )
        )
        .order_by(Match.created_at.desc())
        .all()
    )

    response_items: list[MatchResponse] = []

    for match in matches:
        other_user = match.user2 if match.user1_usernum == current_user.usernum else match.user1

        response_items.append(
            MatchResponse(
                match_id=match.match_id,
                matched_user=build_user_simple_response(other_user),
                chat_room_id=match.chat_room.room_id if match.chat_room else None,
                created_at=match.created_at,
            )
        )

    return MatchListResponse(
        message="매칭 완료된 육아친구 목록입니다.",
        total=len(response_items),
        matches=response_items,
    )