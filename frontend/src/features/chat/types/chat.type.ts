export type ChatMessage = {
  id: string;
  role: "ai" | "user";
  content: string;
  time: string;
};
