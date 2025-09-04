const KEY = "ai_token";

export function setToken(t: string) { if (typeof window !== "undefined") localStorage.setItem(KEY, t); }
export function getToken(): string | null { return typeof window !== "undefined" ? localStorage.getItem(KEY) : null; }
export function clearToken() { if (typeof window !== "undefined") localStorage.removeItem(KEY); }
