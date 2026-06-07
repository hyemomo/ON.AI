import { getAccessToken, logout } from "@/lib/auth";

export const API_BASE_URL = "http://127.0.0.1:8000";

type RequestOptions = RequestInit & {
  auth?: boolean;
  json?: unknown;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const { auth = true, json, headers, ...rest } = options;
  const token = getAccessToken();

  const requestHeaders = new Headers(headers);

  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  let data: unknown = null;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  }

  if (response.status === 401 && auth) {
    logout();
    window.location.href = "/login";
    throw new Error("로그인이 필요합니다.");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "요청 처리 중 오류가 발생했습니다.";

    throw new Error(message);
  }

  return data as T;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "";
  return value.replace("T", " ").slice(0, 19);
}

export function toStaticUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}
