// apps/ai-ui/src/api.ts
export const AI_API_BASE = import.meta.env.VITE_AI_API_BASE || "http://ai-api.asafarim.local:5103";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${AI_API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? (undefined as T) : res.json();
}