import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, setAccessToken, tryRefresh } from './api';

export interface AdminUser { id: string; email: string; name: string; role: 'owner' | 'admin'; isAgent?: boolean }

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const ok = await tryRefresh().catch(() => false);
      if (!active) return; // StrictMode dev double-mount — ค่าจาก invocation เก่าไม่ต้องใช้
      if (ok) {
        try {
          const me = await apiFetch<AdminUser>('/admin/auth/me');
          if (active) setUser(me);
        } catch { /* token ใช้ไม่ได้แล้วระหว่างนี้ — ปล่อยเป็น null ตามปกติ */ }
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  async function login(email: string, password: string) {
    const result = await apiFetch<{ accessToken: string; user: AdminUser }>('/admin/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    setAccessToken(result.accessToken);
    setUser(result.user);
  }

  async function logout() {
    await apiFetch('/admin/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
