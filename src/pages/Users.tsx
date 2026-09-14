import { useEffect, useState } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'admin' as 'admin' | 'owner' });
  const [error, setError] = useState('');

  function load() { apiFetch<any[]>('/admin/users').then(setUsers); }
  useEffect(load, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(form) });
      setForm({ email: '', password: '', name: '', role: 'admin' });
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'สร้างบัญชีไม่สำเร็จ');
    }
  }

  async function toggleStatus(id: string, status: string) {
    try {
      await apiFetch(`/admin/users/${id}/status`, {
        method: 'PATCH', body: JSON.stringify({ status: status === 'active' ? 'suspended' : 'active' }),
      });
      load();
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : 'ทำรายการไม่สำเร็จ');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">ผู้ใช้งาน (Owner เท่านั้น)</h1>

      <table className="w-full bg-white border border-black/10 text-sm mb-8">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-muted">
            <th className="p-3">ชื่อ</th><th className="p-3">อีเมล</th><th className="p-3">สิทธิ์</th>
            <th className="p-3">สถานะ</th><th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-black/5">
              <td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.role}</td>
              <td className="p-3">{u.status}</td>
              <td className="p-3 text-right">
                <button onClick={() => toggleStatus(u._id, u.status)} className="text-red hover:underline">
                  {u.status === 'active' ? 'ระงับ' : 'เปิดใช้งาน'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mb-4">เพิ่มผู้ใช้งาน</h2>
      <form onSubmit={createUser} className="bg-white p-6 border border-black/10 grid grid-cols-2 gap-4">
        <input required placeholder="ชื่อ" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input required type="email" placeholder="อีเมล" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        <input required type="password" placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" value={form.password}
               onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="input">
          <option value="admin">admin</option>
          <option value="owner">owner</option>
        </select>
        {error && <p className="col-span-2 text-red text-sm">{error}</p>}
        <button type="submit" className="col-span-2 bg-red hover:bg-red-bright text-white py-2.5 text-xs uppercase tracking-[.14em]">
          สร้างบัญชี
        </button>
      </form>
    </div>
  );
}
