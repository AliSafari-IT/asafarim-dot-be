import { isProduction } from "@asafarim/shared-ui-react";

export const CORE_API_BASE = isProduction
  ? "https://core.asafarim.be"
  : "http://core-api.asafarim.local:5102";

export interface PagedResponse<T> {
  page: number;
  pageSize: number;
  total: number; // -1 if unknown
  items: T[];
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${CORE_API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Core API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
