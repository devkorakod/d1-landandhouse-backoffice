import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, ApiClientError } from '@/lib/api';
import { MediaUploader } from '@/components/MediaUploader';

const PROJECT_TYPES = ['condo', 'housing_estate', 'townhome', 'mixed_use', 'commercial'];
const CONSTRUCTION_STATUSES = ['planning', 'under_construction', 'completed', 'ready_to_move'];

const empty = {
  name: { th: '', en: '' },
  developer: { th: '', en: '' },
  projectType: 'condo',
  status: 'draft',
  constructionStatus: 'planning',
  description: { th: '', en: '' },
  location: { zone: '', zoneEn: '', address: { th: '', en: '' } },
  totalUnits: undefined as number | undefined,
  totalBuildings: undefined as number | undefined,
  commonFee: undefined as number | undefined,
  foreignQuotaAvailable: false,
  coverImageId: undefined as string | undefined,
  isFeatured: false,
};

export function ProjectFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    apiFetch<any>(`/admin/projects/${id}`).then((p) => {
      setForm({
        name: { th: p.name?.th ?? '', en: p.name?.en ?? '' },
        developer: { th: p.developer?.th ?? '', en: p.developer?.en ?? '' },
        projectType: p.projectType, status: p.status, constructionStatus: p.constructionStatus,
        description: { th: p.description?.th ?? '', en: p.description?.en ?? '' },
        location: {
          zone: p.location?.zone ?? '', zoneEn: p.location?.zoneEn ?? '',
          address: { th: p.location?.address?.th ?? '', en: p.location?.address?.en ?? '' },
        },
        totalUnits: p.totalUnits, totalBuildings: p.totalBuildings, commonFee: p.commonFee,
        foreignQuotaAvailable: !!p.foreignQuotaAvailable,
        coverImageId: p.coverImage?.mediaId,
        isFeatured: !!p.isFeatured,
      });
      setCoverUrl(p.coverImage?.url);
    });
  }, [id, isNew]);

  function buildPayload() {
    const { description, developer, location, ...rest } = form;
    return {
      ...rest,
      ...(description.th.trim() ? { description } : {}),
      ...(developer.th.trim() ? { developer } : {}),
      location: {
        ...location,
        ...(location.address.th.trim() ? {} : { address: undefined }),
      },
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = buildPayload();
      if (isNew) {
        await apiFetch('/admin/projects', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/admin/projects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      }
      navigate('/projects');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{isNew ? 'เพิ่มโครงการ' : 'แก้ไขโครงการ'}</h1>
      <form onSubmit={onSubmit} className="bg-white p-6 border border-black/10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="ชื่อโครงการ (ไทย)">
            <input required value={form.name.th} onChange={(e) => set({ name: { ...form.name, th: e.target.value } })} className="input" />
          </Field>
          <Field label="ชื่อโครงการ (English)">
            <input value={form.name.en} onChange={(e) => set({ name: { ...form.name, en: e.target.value } })} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ผู้พัฒนาโครงการ (ไทย)">
            <input value={form.developer.th} onChange={(e) => set({ developer: { ...form.developer, th: e.target.value } })} className="input" />
          </Field>
          <Field label="ผู้พัฒนาโครงการ (English)">
            <input value={form.developer.en} onChange={(e) => set({ developer: { ...form.developer, en: e.target.value } })} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="รายละเอียด (ไทย)">
            <textarea rows={3} value={form.description.th} onChange={(e) => set({ description: { ...form.description, th: e.target.value } })} className="input" />
          </Field>
          <Field label="รายละเอียด (English)">
            <textarea rows={3} value={form.description.en} onChange={(e) => set({ description: { ...form.description, en: e.target.value } })} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="ประเภทโครงการ">
            <select value={form.projectType} onChange={(e) => set({ projectType: e.target.value })} className="input">
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="สถานะการก่อสร้าง">
            <select value={form.constructionStatus} onChange={(e) => set({ constructionStatus: e.target.value })} className="input">
              {CONSTRUCTION_STATUSES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="สถานะเผยแพร่">
            <select value={form.status} onChange={(e) => set({ status: e.target.value })} className="input">
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="hidden">hidden</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="จำนวนยูนิตทั้งหมด">
            <input type="number" value={form.totalUnits ?? ''}
                   onChange={(e) => set({ totalUnits: e.target.value ? Number(e.target.value) : undefined })} className="input" />
          </Field>
          <Field label="จำนวนอาคาร">
            <input type="number" value={form.totalBuildings ?? ''}
                   onChange={(e) => set({ totalBuildings: e.target.value ? Number(e.target.value) : undefined })} className="input" />
          </Field>
          <Field label="ค่าส่วนกลาง (บาท/ตร.ม./เดือน)">
            <input type="number" value={form.commonFee ?? ''}
                   onChange={(e) => set({ commonFee: e.target.value ? Number(e.target.value) : undefined })} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ย่าน/ทำเล (ไทย)">
            <input value={form.location.zone} onChange={(e) => set({ location: { ...form.location, zone: e.target.value } })} className="input" />
          </Field>
          <Field label="ย่าน/ทำเล (English)">
            <input value={form.location.zoneEn} onChange={(e) => set({ location: { ...form.location, zoneEn: e.target.value } })} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ที่อยู่แสดงผล (ไทย)">
            <input value={form.location.address.th}
                   onChange={(e) => set({ location: { ...form.location, address: { ...form.location.address, th: e.target.value } } })} className="input" />
          </Field>
          <Field label="ที่อยู่แสดงผล (English)">
            <input value={form.location.address.en}
                   onChange={(e) => set({ location: { ...form.location, address: { ...form.location.address, en: e.target.value } } })} className="input" />
          </Field>
        </div>

        <Field label="ภาพหน้าปก">
          <MediaUploader value={coverUrl} onChange={(mediaId, url) => { set({ coverImageId: mediaId }); setCoverUrl(url); }} />
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} />
            แสดงเป็นโครงการแนะนำหน้าแรก
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.foreignQuotaAvailable}
                   onChange={(e) => set({ foreignQuotaAvailable: e.target.checked })} />
            มีโควตาต่างชาติ
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
