import { useEffect, useState } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { apiFetch<any>('/admin/settings').then(setSettings); }, []);

  if (!settings) return <p className="text-muted">กำลังโหลด...</p>;

  const cc = settings.contactChannels ?? {};
  const nf = settings.notifications ?? { enabled: true, telegramEnabled: true, emailEnabled: false, notifyEmail: '' };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ siteName: settings.siteName, contactChannels: cc, notifications: nf }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'บันทึกไม่สำเร็จ');
    }
  }

  const setCc = (patch: Record<string, string>) =>
    setSettings((s: any) => ({ ...s, contactChannels: { ...s.contactChannels, ...patch } }));

  const setNf = (patch: Record<string, unknown>) =>
    setSettings((s: any) => ({
      ...s,
      notifications: { enabled: true, telegramEnabled: true, emailEnabled: false, notifyEmail: '', ...s.notifications, ...patch },
    }));

  const readOnly = user?.role !== 'owner';

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-2">ตั้งค่าระบบ</h1>
      {readOnly && <p className="text-muted text-sm mb-6">เฉพาะ Owner เท่านั้นที่แก้ไขได้ — คุณดูได้อย่างเดียว</p>}
      <form onSubmit={save} className="bg-white p-6 border border-black/10 space-y-4">
        <Field label="ชื่อเว็บไซต์">
          <input disabled={readOnly} value={settings.siteName ?? ''}
                 onChange={(e) => setSettings((s: any) => ({ ...s, siteName: e.target.value }))} className="input" />
        </Field>
        <Field label="เบอร์โทร">
          <input disabled={readOnly} value={cc.phone ?? ''} onChange={(e) => setCc({ phone: e.target.value })} className="input" />
        </Field>
        <Field label="LINE ID">
          <input disabled={readOnly} value={cc.lineId ?? ''} onChange={(e) => setCc({ lineId: e.target.value })} className="input" />
        </Field>
        <Field label="LINE URL">
          <input disabled={readOnly} value={cc.lineUrl ?? ''} onChange={(e) => setCc({ lineUrl: e.target.value })} className="input" />
        </Field>
        <Field label="อีเมลติดต่อ (แสดงบนเว็บสาธารณะ)">
          <input disabled={readOnly} value={cc.email ?? ''} onChange={(e) => setCc({ email: e.target.value })} className="input" />
        </Field>
        <Field label="เวลาทำการ">
          <input disabled={readOnly} value={cc.officeHours ?? ''} onChange={(e) => setCc({ officeHours: e.target.value })} className="input" />
        </Field>

        <div className="pt-4 mt-2 border-t border-black/10">
          <h2 className="text-sm font-semibold mb-1">การแจ้งเตือนลีดใหม่</h2>
          <p className="text-muted text-xs mb-3">ตั้งค่าภายใน ไม่แสดงบนเว็บสาธารณะ</p>

          <label className="flex items-center gap-2 text-sm mb-3">
            <input type="checkbox" disabled={readOnly} checked={!!nf.enabled}
                   onChange={(e) => setNf({ enabled: e.target.checked })} />
            เปิดใช้งานการแจ้งเตือน
          </label>

          <div className={`space-y-3 pl-1 ${nf.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={readOnly} checked={!!nf.telegramEnabled}
                     onChange={(e) => setNf({ telegramEnabled: e.target.checked })} />
              แจ้งผ่าน Telegram
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={readOnly} checked={!!nf.emailEnabled}
                     onChange={(e) => setNf({ emailEnabled: e.target.checked })} />
              แจ้งผ่านอีเมล
            </label>

            <Field label="อีเมลที่จะรับการแจ้งเตือน">
              <input disabled={readOnly || !nf.emailEnabled} type="email" placeholder="sales@d1landandhouse.co.th"
                     value={nf.notifyEmail ?? ''} onChange={(e) => setNf({ notifyEmail: e.target.value })} className="input" />
            </Field>
          </div>
        </div>

        {error && <p className="text-red text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">บันทึกแล้ว</p>}
        {!readOnly && (
          <button type="submit" className="bg-red hover:bg-red-bright text-white px-6 py-2.5 text-xs uppercase tracking-[.14em]">
            บันทึก
          </button>
        )}
      </form>

      <ChangePasswordCard />
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    if (newPassword !== confirmPassword) {
      setError('ยืนยันรหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    setBusy(true);
    try {
      await apiFetch('/admin/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 border border-black/10 space-y-4 mt-6">
      <h2 className="text-sm font-semibold">เปลี่ยนรหัสผ่านของฉัน</h2>
      <Field label="รหัสผ่านปัจจุบัน">
        <input type="password" required autoComplete="current-password" className="input"
               value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </Field>
      <Field label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)">
        <input type="password" required minLength={8} autoComplete="new-password" className="input"
               value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </Field>
      <Field label="ยืนยันรหัสผ่านใหม่">
        <input type="password" required minLength={8} autoComplete="new-password" className="input"
               value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </Field>
      {error && <p className="text-red text-sm">{error}</p>}
      {saved && <p className="text-green-700 text-sm">เปลี่ยนรหัสผ่านแล้ว</p>}
      <button type="submit" disabled={busy}
              className="bg-red hover:bg-red-bright text-white px-6 py-2.5 text-xs uppercase tracking-[.14em] disabled:opacity-60">
        {busy ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="block text-muted mb-1">{label}</span>{children}</label>;
}
