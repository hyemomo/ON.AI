import type { Comment, Post } from '@/features/community/post-detail/types/types';

export const POST: Post = {
  id: 1,
  author: "김지연",
  authorLevel: "레벨 5",
  childAge: "14개월",
  timeAgo: "2시간 전",
  category: "🌡️ 건강",
  categoryColor: "green",
  title:
    "새벽에 열이 38.9도까지 올랐어요 — ON.AI가 알려준 대로 했더니 효과가 있었어요",
  body: `어젯밤 새벽 2시에 아이 열이 갑자기 38.9도까지 올라서 너무 무서웠어요.

남편은 출장 중이라 혼자였는데, 무작정 응급실에 달려가야 하나 싶어서 일단 ON.AI 도우미한테 물어봤어요.

그랬더니 아이 나이랑 증상을 물어보고는 침착하게 단계별로 알려주더라고요. 타이레놀 시럽은 4~6시간 간격으로 줄 수 있고, 마지막으로 먹인 게 3시간 전이면 조금 더 기다려보라고 했어요. 그리고 수분을 조금씩 자주 먹이고, 실내 온도는 24도 정도로 맞추고, 얇은 옷으로 갈아입히라고 했어요.

그대로 했더니 한 시간 만에 38.1도로 내려갔고, 아침에는 정상 체온이 됐어요. 😭

혼자였으면 너무 무서웠을 텐데 ON.AI 덕분에 정말 많이 안심이 됐어요. 이런 서비스가 있다는 게 진짜 다행이에요. 특히 새벽에 전화할 곳도 없고, 인터넷 검색하면 너무 무서운 얘기만 나오는데 차분하게 상황에 맞게 알려주는 게 너무 좋았어요.

비슷한 경험 있으신 분들 계세요? 여러분은 아이 갑자기 열날 때 어떻게 대처하시나요?`,
  emoji: "🐣",
  likes: 284,
  comments: 72,
  views: 1284,
  isHot: true,
  liked: true,
};

export const COMMENTS: Comment[] = [
  {
    id: 1,
    author: "박수민",
    emoji: "🌷",
    childAge: "7개월",
    timeAgo: "1시간 전",
    body: "저도 비슷한 경험이 있어요! 새벽에 열 나면 진짜 혼자 패닉되는데... ON.AI 덕분에 많이 안정됐죠. 수분 보충이 정말 중요하더라고요.",
    likes: 24,
    liked: true,
  },
  {
    id: 2,
    author: "이준혁",
    authorLevel: "아빠 참여",
    emoji: "🐻",
    childAge: "18개월",
    timeAgo: "45분 전",
    body: "저도 비슷했어요. 아내가 혼자 있을 때 아이 열이 올라서 연락이 왔는데 저는 출장 중이라 아무것도 못 해줘서 너무 미안했었거든요. 이제는 ON.AI 앱 알려드렸어요. 이런 서비스 진짜 필요했어요.",
    likes: 18,
  },
  {
    id: 3,
    author: "최예진",
    emoji: "🌻",
    childAge: "24개월",
    timeAgo: "32분 전",
    body: "저희 아이도 얼마 전에 고열이 났었는데, 38.5도 넘어가면 병원 가야 하는 줄 알고 무조건 응급실 달려갔었어요 😅 이런 거 알았으면 훨씬 침착했을 텐데. 좋은 정보 감사해요!",
    likes: 31,
    liked: true,
  },
  {
    id: 4,
    author: "정다은",
    authorLevel: "레벨 8",
    emoji: "🍀",
    childAge: "36개월",
    timeAgo: "15분 전",
    body: "저도 3년째 ON.AI 사용 중인데 진짜 없으면 어떻게 살았을까 싶어요. 특히 첫째 때 경험이 없어서 하나하나 다 무서웠는데 이제는 제가 다른 엄마들한테 ON.AI 추천해주고 있어요 ㅎㅎ",
    likes: 44,
    liked: true,
  },
];
