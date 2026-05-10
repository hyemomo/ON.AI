const BASE_URL = "http://localhost:8000/api";

export interface Source {
  collection: string;
  title: string;
}

export interface ChatApiResponse {
  reply: string;
  sources: Source[];
}

export async function sendChatMessage(message: string): Promise<ChatApiResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("서버 오류가 발생했습니다.");
  }

  return res.json();
}
