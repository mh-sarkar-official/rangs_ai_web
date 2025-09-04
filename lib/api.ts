// import { getToken } from "./storage";

// const BASE = process.env.NEXT_PUBLIC_API;

// function headers(extra?: Record<string,string>) {
//   const h: Record<string,string> = { "Content-Type": "application/json" };
//   const t = getToken();
//   if (t) h["Authorization"] = `Bearer ${t}`;
//   return { ...h, ...(extra || {}) };
// }

// export async function apiGet<T>(path: string): Promise<T> {
//   if (!BASE) throw new Error("NEXT_PUBLIC_API not set");
//   const r = await fetch(`${BASE}${path}`, { headers: headers() });
//   if (!r.ok) throw new Error(await r.text());
//   return r.json();
// }

// export async function apiPost<T>(path: string, body?: any, conversationId?: number): Promise<T> {
//   if (!BASE) throw new Error("NEXT_PUBLIC_API not set");
//   const h: Record<string,string> = headers();
//   if (conversationId) h["X-Conversation-Id"] = String(conversationId);
//   const r = await fetch(`${BASE}${path}`, { method: "POST", headers: h, body: JSON.stringify(body || {}) });
//   if (!r.ok) throw new Error(await r.text());
//   return r.json();
// }



const BASE = process.env.NEXT_PUBLIC_API || "/api";

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(extra || {}) };
}

async function readError(res: Response) {
  let txt = await res.text();
  try { const j = JSON.parse(txt); txt = j?.detail || j?.error || txt; } catch {}
  return txt || `${res.status} ${res.statusText}`;
}

export async function apiGet<T>(path: string, headers?: HeadersInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: authHeaders(headers) });
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  } catch (e: any) {
    console.error("GET failed", path, e);
    throw e;
  }
}

export async function apiPost<T>(
  path: string,
  body: any,
  conversationId?: number,
  headers?: HeadersInit
): Promise<T> {
  try {
    const h: HeadersInit = { "Content-Type": "application/json", ...authHeaders(headers) };
    if (conversationId) (h as any)["X-Conversation-Id"] = String(conversationId);
    const res = await fetch(`${BASE}${path}`, { method: "POST", headers: h, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  } catch (e: any) {
    console.error("POST failed", path, e);
    throw e;
  }
}
