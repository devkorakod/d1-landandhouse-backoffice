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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ siteName: settings.siteName, contactChannels: cc }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'บันทึกไม่สำเร็จ');
    }
  }

  const setCc = (patch: Record<string, string>) =>
    setSettings((s: any) => ({ ...s, contactChannels: { ...s.contactChannels, ...patch } }));

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
        <Field label="อีเมลรับลีด">
          <input disabled={readOnly} value={cc.email ?? ''} onChange={(e) => setCc({ email: e.target.value })} className="input" />
        </Field>
        <Field label="เวลาทำการ">
          <input disabled={readOnly} value={cc.officeHours ?? ''} onChange={(e) => setCc({ officeHours: e.target.value })} className="input" />
        </Field>
        {error && <p className="text-red text-sm">{error}</p>}
        {saved && <p className="text-green-700 text-sm">บันทึกแล้ว</p>}
        {!readOnly && (
          <button type="submit" className="bg-red hover:bg-red-bright text-white px-6 py-2.5 text-xs uppercase tracking-[.14em]">
            บันทึก
          </button>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="block text-muted mb-1">{label}</span>{children}</label>;
}
