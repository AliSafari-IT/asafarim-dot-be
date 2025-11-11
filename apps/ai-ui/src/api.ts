// apps/ai-ui/src/api.ts
const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
function preferSubdomain(base: string, subdomainBase: string): string {
  if (currentHost.endsWith('.asafarim.local') && base.includes('localhost')) {
    return subdomainBase;
  }
  return base;
}

const AI_API_BASE_RAW = import.meta.env.VITE_AI_API_BASE || "http://ai.asafarim.local:5103";

export const AI_API_BASE = preferSubdomain(AI_API_BASE_RAW, "http://ai.asafarim.local:5103");

export async function aiApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  console.log("ai api call:", AI_API_BASE, path);
  const res = await fetch(`${AI_API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  console.log("ai api response:", res.status);
  
  // Return undefined for 204 No Content responses
  if (res.status === 204) return undefined as T;
  
  // Clone the response before reading it, so we can read it again if needed
  const resClone = res.clone();
  
  try {
    const jsonParsed = await res.json();
    console.log("ai api response body:", jsonParsed);
    return jsonParsed;
  } catch (e) {
    // If JSON parsing fails, try to get the text content from the cloned response
    try {
      const textContent = await resClone.text();
      console.log("ai api response body (text):", textContent);
    } catch (textError) {
      console.log("Failed to read response body as text", textError);
    }
    throw e;
  }
}
