import { API_BASE_URL } from "../config/api";

export interface PagedResponse<T> {
  page: number;
  pageSize: number;
  total: number; // -1 if unknown
  items: T[];
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Accept": "application/json",
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

export async function apiPost<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: "include",
    headers: {
      "Accept": "application/json",
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

export async function apiPut<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Core API ${res.status}: ${text || res.statusText}`);
  }

  // Handle void responses (empty body)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  // For non-JSON responses, return null or handle appropriately
  return null as T;
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Core API ${res.status}: ${text || res.statusText}`);
  }

  // Handle void responses (empty body)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  // For non-JSON responses, return null or handle appropriately
  return null as T;
}

export async function apiGetPaged<T>(path: string, init?: RequestInit): Promise<PagedResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Core API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<PagedResponse<T>>;
}

export async function apiPostPaged<T>(path: string, init?: RequestInit): Promise<PagedResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Core API ${res.status}: ${text || res.statusText}`);
  }

  // Handle void responses (empty body) - return empty paged response
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {
      page: 1,
      pageSize: 0,
      total: 0,
      items: []
    } as PagedResponse<T>;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<PagedResponse<T>>;
  }

  // For non-JSON responses, return empty paged response
  return {
    page: 1,
    pageSize: 0,
    total: 0,
    items: []
  } as PagedResponse<T>;
}

export async function apiPutPaged<T>(path: string, init?: RequestInit): Promise<PagedResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Core API ${res.status}: ${text || res.statusText}`);
  }

  // Handle void responses (empty body) - return empty paged response
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {
      page: 1,
      pageSize: 0,
      total: 0,
      items: []
    } as PagedResponse<T>;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<PagedResponse<T>>;
  }

  // For non-JSON responses, return empty paged response
  return {
    page: 1,
    pageSize: 0,
    total: 0,
    items: []
  } as PagedResponse<T>;
}

export async function apiDeletePaged<T>(path: string, init?: RequestInit): Promise<PagedResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Core API ${res.status}: ${text || res.statusText}`);
  }

  // Handle void responses (empty body) - return empty paged response
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {
      page: 1,
      pageSize: 0,
      total: 0,
      items: []
    } as PagedResponse<T>;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json() as Promise<PagedResponse<T>>;
  }

  // For non-JSON responses, return empty paged response
  return {
    page: 1,
    pageSize: 0,
    total: 0,
    items: []
  } as PagedResponse<T>;
}
