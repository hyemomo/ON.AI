export const ACCESS_TOKEN_KEY = "access_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getAccessToken();
}

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
