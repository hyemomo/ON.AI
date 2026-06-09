import { API_BASE_URL } from "@/lib/api";
import type { ChatMessage, Source } from "../types/chat.type";

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
  const filtered = messages.filter(
    (message) => !message.id.startsWith("initial-"),
  );

  const startIndex = filtered.findIndex((message) => message.role === "user");

  if (startIndex === -1) return [];

  return filtered.slice(startIndex).map((message) => ({
    role: message.role === "ai" ? "model" : "user",
    content: message.content,
  }));
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  mode: string = "",
  policyCategory: string = "",
  userContext: string = "",
): Promise<ChatApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: buildHistory(history),
      mode,
      policy_category: policyCategory,
      user_context: userContext,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("챗봇 API 오류:", response.status, errorText);
    throw new Error("서버 오류가 발생했습니다.");
  }

  return response.json();
}