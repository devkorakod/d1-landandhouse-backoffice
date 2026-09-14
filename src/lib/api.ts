const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

export class ApiClientError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;

/**
 * Single-flight refresh — สำคัญมากตอน bootstrap: React StrictMode (dev only) mount
 * effect ซ้ำสองรอบ ถ้าไม่ dedupe ตรงนี้จะยิง /admin/auth/refresh พร้อมกัน 2 ครั้ง
 * ครั้งที่แพ้จะได้ 401 (refresh token หมุนไปแล้ว) แล้วเผลอ setUser(null) ทับของจริง
 */
export async function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${BASE}/admin/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) { accessToken = json.data.accessToken; return true; }
        accessToken = null;
        return false;
      })
      .catch(() => { accessToken = null; return false; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) return apiFetch<T>(path, init, false);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiClientError(
      json?.error?.code ?? 'INTERNAL_ERROR',
      json?.error?.message ?? 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
      res.status,
    );
  }
  return json.data as T;
}

export async function apiFetchFull<T>(path: string, init: RequestInit = {}): Promise<{ data: T; meta?: any }> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiClientError(json?.error?.code ?? 'INTERNAL_ERROR', json?.error?.message ?? 'ผิดพลาด', res.status);
  }
  return { data: json.data, meta: json.meta };
}
