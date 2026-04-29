import type { ChatMessage } from "@/features/chat/types/chat.type";

export const initialMessages: ChatMessage[] = [
  {
    id: "initial-ai-1",
    role: "ai",
    content: "안녕하세요! 저는 ON.AI 육아 도우미예요 🌸",
    time: "오전 9:21",
  },
  {
    id: "initial-ai-2",
    role: "ai",
    content: "오늘 어떤 것이 궁금하신가요?",
    time: "오전 9:21",
  },
  {
    id: "initial-user-1",
    role: "user",
    content: "아이가 밤새 38.5도 열이 나요. 어떻게 해야 할까요?",
    time: "오전 9:22",
  },
];
export const aiReplies = [
  "네, 이 경우엔 조금 더 지켜보시는 게 좋을 것 같아요 😊",
  "14개월 기준으로 안내드릴게요. 수분 섭취와 아이 컨디션을 함께 확인해주세요.",
  "좋은 질문이에요! 아이의 나이, 체온, 마지막 약 복용 시간을 같이 보면 더 정확해요 🌸",
  "수분 보충이 중요해요. 물이나 전해질 음료를 조금씩 자주 주세요 🥤",
  "열이 계속 오르거나 아이가 처지는 모습이 있으면 소아과 방문을 추천드려요.",
];
