import { getToken } from "./storage";

const BASE = process.env.NEXT_PUBLIC_API;

function headers(extra?: Record<string,string>) {
  const h: Record<string,string> = { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true", };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return { ...h, ...(extra || {}) };
}

export async function apiGet<T>(path: string): Promise<T> {
  if (!BASE) throw new Error("NEXT_PUBLIC_API not set");
  const r = await fetch(`${BASE}${path}`, { headers: headers() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiPost<T>(path: string, body?: any, conversationId?: number): Promise<T> {
  if (!BASE) throw new Error("NEXT_PUBLIC_API not set");
  const h: Record<string,string> = headers();
  if (conversationId) h["X-Conversation-Id"] = String(conversationId);
  const r = await fetch(`${BASE}${path}`, { method: "POST", headers: h, body: JSON.stringify(body || {}) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
