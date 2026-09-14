import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, ApiClientError } from '@/lib/api';

const DISCOUNT_TYPES = ['percentage', 'fixed', 'custom'];
const APPLIES_TO = ['all', 'properties', 'property_types'];
const PROPERTY_TYPES = ['house', 'condo', 'land', 'townhouse', 'commercial', 'apartment', 'villa', 'office', 'warehouse', 'hotel'];

function toInputDate(d?: string | Date) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

const empty = {
  title: { th: '', en: '' },
  badgeText: { th: '', en: '' },
  badgeColor: '#B3241E',
  discountType: 'percentage' as string,
  discountValue: 0,
  appliesTo: 'all' as string,
  targetPropertyIds: [] as string[],
  targetPropertyTypes: [] as string[],
  startAt: '',
  endAt: '',
  showCountdown: true,
  priority: 0,
  isActive: true,
  terms: { th: '' },
};

export function PromotionFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [properties, setProperties] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<any[]>('/admin/properties?limit=100').then(setProperties).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    apiFetch<any>(`/admin/promotions/${id}`).then((p) => {
      setForm({
        title: { th: p.title?.th ?? '', en: p.title?.en ?? '' },
        badgeText: { th: p.badgeText?.th ?? '', en: p.badgeText?.en ?? '' },
        badgeColor: p.badgeColor ?? '#B3241E',
        discountType: p.discountType, discountValue: p.discountValue ?? 0,
        appliesTo: p.appliesTo,
        targetPropertyIds: (p.targetPropertyIds ?? []).map(String),
        targetPropertyTypes: p.targetPropertyTypes ?? [],
        startAt: toInputDate(p.startAt), endAt: toInputDate(p.endAt),
        showCountdown: !!p.showCountdown, priority: p.priority ?? 0, isActive: !!p.isActive,
        terms: { th: p.terms?.th ?? '' },
      });
    });
  }, [id, isNew]);

  function buildPayload() {
    const { terms, ...rest } = form;
    return {
      ...rest,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      ...(terms.th.trim() ? { terms } : {}),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = buildPayload();
      if (isNew) {
        await apiFetch('/admin/promotions', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/admin/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      }
      navigate('/promotions');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const toggleArr = (key: 'targetPropertyIds' | 'targetPropertyTypes', value: string) => {
    setForm((f) => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{isNew ? 'เพิ่มโปรโมชั่น' : 'แก้ไขโปรโมชั่น'}</h1>
      <form onSubmit={onSubmit} className="bg-white p-6 border border-black/10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="ชื่อโปรโมชั่น (ไทย)">
            <input required value={form.title.th} onChange={(e) => set({ title: { ...form.title, th: e.target.value } })} className="input" />
          </Field>
          <Field label="ป้ายบนการ์ด (เช่น ลด 5%)">
            <input required value={form.badgeText.th} onChange={(e) => set({ badgeText: { ...form.badgeText, th: e.target.value } })} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="ประเภทส่วนลด">
            <select value={form.discountType} onChange={(e) => set({ discountType: e.target.value })} className="input">
              {DISCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label={form.discountType === 'percentage' ? 'ส่วนลด (%)' : 'ส่วนลด (บาท)'}>
            <input type="number" value={form.discountValue}
                   onChange={(e) => set({ discountValue: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="สีป้าย">
            <input type="color" value={form.badgeColor} onChange={(e) => set({ badgeColor: e.target.value })}
                   className="input h-[38px] p-1" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="วันเริ่มต้น">
            <input required type="date" value={form.startAt} onChange={(e) => set({ startAt: e.target.value })} className="input" />
          </Field>
          <Field label="วันสิ้นสุด">
            <input required type="date" value={form.endAt} onChange={(e) => set({ endAt: e.target.value })} className="input" />
          </Field>
        </div>

        <Field label="ใช้กับ">
          <select value={form.appliesTo} onChange={(e) => set({ appliesTo: e.target.value })} className="input">
            {APPLIES_TO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>

        {form.appliesTo === 'properties' && (
          <Field label="เลือกทรัพย์ที่ร่วมรายการ">
            <div className="max-h-40 overflow-auto border border-black/15 p-2 space-y-1">
              {properties.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.targetPropertyIds.includes(p.id)}
                         onChange={() => toggleArr('targetPropertyIds', p.id)} />
                  {p.code} — {p.title?.th}
                </label>
              ))}
              {properties.length === 0 && <p className="text-xs text-muted">ยังไม่มีทรัพย์ในระบบ</p>}
            </div>
          </Field>
        )}

        {form.appliesTo === 'property_types' && (
          <Field label="เลือกประเภททรัพย์ที่ร่วมรายการ">
            <div className="grid grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.targetPropertyTypes.includes(t)}
                         onChange={() => toggleArr('targetPropertyTypes', t)} />
                  {t}
                </label>
              ))}
            </div>
          </Field>
        )}

        <Field label="เงื่อนไข (ถ้ามี)">
          <textarea rows={3} value={form.terms.th} onChange={(e) => set({ terms: { th: e.target.value } })} className="input" />
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} />
            เปิดใช้งาน
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showCountdown} onChange={(e) => set({ showCountdown: e.target.checked })} />
            แสดงนาฬิกานับถอยหลัง
          </label>
        </div>

        {error && <p className="text-red text-sm">{error}</p>}

        <button disabled={busy} type="submit"
                className="bg-red hover:bg-red-bright text-white px-6 py-2.5 text-xs uppercase tracking-[.14em] disabled:opacity-60">
          {busy ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="block text-muted mb-1">{label}</span>{children}</label>;
}
