import type {
  Comment,
  Post,
} from "@/features/community/post-detail/types/types";

export const POST: Post = {
  postnum: 1,
  p_user: 1,
  p_title:
    "새벽에 열이 38.9도까지 올랐어요 — ON.AI가 알려준 대로 했더니 효과가 있었어요",
  p_content: `어젯밤 새벽 2시에 아이 열이 갑자기 38.9도까지 올라서 너무 무서웠어요.

남편은 출장 중이라 혼자였는데, 무작정 응급실에 달려가야 하나 싶어서 일단 ON.AI 도우미한테 물어봤어요.

그랬더니 아이 나이랑 증상을 물어보고는 침착하게 단계별로 알려주더라고요.

그대로 했더니 한 시간 만에 38.1도로 내려갔고, 아침에는 정상 체온이 됐어요.

비슷한 경험 있으신 분들 계세요? 여러분은 아이 갑자기 열날 때 어떻게 대처하시나요?`,
  p_region_tag: "서울 강남구",
  p_category_tag: "육아정보",
  nickname: "김지연",
  p_created_at: "2026-05-14T20:25:51",
  image_urls: [],
  like_count: 284,
  comment_count: 4,
  is_liked: true,
};

export const COMMENTS: Comment[] = [
  {
    commentnum: 1,
    c_user: 2,
    c_post: 1,
    nickname: "박수민",
    c_created_at: "2026-05-14T21:25:51",
    c_content:
      "저도 비슷한 경험이 있어요! 새벽에 열 나면 진짜 혼자 패닉되는데 수분 보충이 정말 중요하더라고요.",
  },
  {
    commentnum: 2,
    c_user: 3,
    c_post: 1,
    nickname: "이준혁",
    c_created_at: "2026-05-14T21:40:51",
    c_content: "저도 비슷했어요. 이런 서비스 진짜 필요했다고 생각합니다.",
  },
  {
    commentnum: 3,
    c_user: 4,
    c_post: 1,
    nickname: "최예진",
    c_created_at: "2026-05-14T21:53:51",
    c_content: "저희 아이도 얼마 전에 고열이 났었는데, 좋은 정보 감사합니다.",
  },
  {
    commentnum: 4,
    c_user: 5,
    c_post: 1,
    nickname: "정다은",
    c_created_at: "2026-05-14T22:10:51",
    c_content:
      "첫째 때 경험이 없어서 하나하나 다 무서웠는데 이런 기능 있으면 진짜 도움 될 것 같아요.",
  },
];
