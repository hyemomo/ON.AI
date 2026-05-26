import type { ChatMessage, Source } from "../types/chat.type";

const BASE_URL = "http://localhost:8000/api";

export type { Source };

export interface ChatApiResponse {
  reply: string;
  category: string;
  sources: Source[];
  is_fallback: boolean;
}

interface HistoryMessage {
  role: "user" | "model";
  content: string;
}

function buildHistory(messages: ChatMessage[]): HistoryMessage[] {
  // initial- ID 메시지(초기 AI 인사말) 제외
  const filtered = messages.filter((m) => !m.id.startsWith("initial-"));

  // user 메시지부터 시작하도록 앞부분 자르기 (Gemini API 요구사항)
  const startIdx = filtered.findIndex((m) => m.role === "user");
  if (startIdx === -1) return [];

  return filtered.slice(startIdx).map((m) => ({
    role: m.role === "ai" ? "model" : "user",
    content: m.content,
  }));
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  mode: string = "",
  policyCategory: string = ""
): Promise<ChatApiResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: buildHistory(history), mode, policy_category: policyCategory }),
  });

  if (!res.ok) {
    throw new Error("서버 오류가 발생했습니다.");
  }

  return res.json();
}
