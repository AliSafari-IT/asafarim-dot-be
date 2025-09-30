import { isProduction } from "@asafarim/shared-ui-react";

export const CORE_API_BASE = isProduction
  ? "https://core.asafarim.be/api/core"
  : "http://core-api.asafarim.local:5102/api";

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

// Helper function to get cookie value
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}
