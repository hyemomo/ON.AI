export type Source = {
  collection: string;
  title: string;
  url?: string;
};

export type ChatMode = "policy" | "parenting" | "first_aid" | "counseling";

export type ChatMessage = {
  id: string;
  role: "ai" | "user";
  content: string;
  time: string;
  category?: string;
  is_fallback?: boolean;
  sources?: Source[];
};
