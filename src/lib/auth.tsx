import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, setAccessToken } from './api';

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
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'}/admin/auth/refresh`,
          { method: 'POST', credentials: 'include' });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) {
          setAccessToken(json.data.accessToken);
          const me = await apiFetch<AdminUser>('/admin/auth/me');
          setUser(me);
        }
      } catch { /* ยังไม่ได้ล็อกอิน */ }
      setLoading(false);
    })();
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
