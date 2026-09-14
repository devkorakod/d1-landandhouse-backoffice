import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ApiClientError } from '@/lib/api';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <form onSubmit={onSubmit} className="bg-white p-8 w-full max-w-sm">
        <div className="font-display text-xl tracking-[.2em] mb-8 text-center">
          D1<span className="text-red">·</span>LANDANDHOUSE
        </div>
        <p className="text-xs uppercase tracking-[.16em] text-muted mb-6 text-center">Backoffice Login</p>
        <label className="block text-sm mb-1">อีเมล</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
               className="w-full border border-black/15 px-3 py-2.5 mb-4 text-sm focus:border-red outline-none" />
        <label className="block text-sm mb-1">รหัสผ่าน</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
               className="w-full border border-black/15 px-3 py-2.5 mb-6 text-sm focus:border-red outline-none" />
        {error && <p className="text-red text-sm mb-4">{error}</p>}
        <button disabled={busy} type="submit"
                className="w-full bg-red hover:bg-red-bright text-white py-3 text-xs uppercase tracking-[.16em] disabled:opacity-60">
          {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
