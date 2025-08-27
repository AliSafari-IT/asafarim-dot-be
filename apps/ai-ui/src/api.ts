// apps/ai-ui/src/api.ts
const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
function preferSubdomain(base: string, subdomainBase: string): string {
  if (currentHost.endsWith('.asafarim.local') && base.includes('localhost')) {
    return subdomainBase;
  }
  return base;
}

const AI_API_BASE_RAW = import.meta.env.VITE_AI_API_BASE || "http://ai-api.asafarim.local:5103";
const CORE_API_BASE_RAW = import.meta.env.VITE_CORE_API_BASE || "http://core-api.asafarim.local:5102";

export const AI_API_BASE = preferSubdomain(AI_API_BASE_RAW, "http://ai-api.asafarim.local:5103");
export const CORE_API_BASE = preferSubdomain(CORE_API_BASE_RAW, "http://core-api.asafarim.local:5102");

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${AI_API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function coreApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CORE_API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? (undefined as T) : res.json();
}