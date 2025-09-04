import { apiPost, apiGet } from "./api";
import { setToken } from "./storage";

export async function login(emp_id: string, password: string) {
  const res = await apiPost<{ access_token: string }>("/auth/login", { emp_id, password });
  if (!res?.access_token) throw new Error("No token returned");
  setToken(res.access_token);
  return res;
}

export function me() {
  return apiGet<{ emp_id: string; role: string }>("/auth/me");
}
