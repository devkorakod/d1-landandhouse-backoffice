import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, ApiClientError } from '@/lib/api';
import { MediaUploader } from '@/components/MediaUploader';

const PROPERTY_TYPES = ['house', 'condo', 'land', 'townhouse', 'commercial', 'apartment', 'villa', 'office', 'warehouse', 'hotel'];
const LISTING_TYPES = ['sale', 'rent', 'sale_rent'];
const STATUSES = ['draft', 'published', 'reserved', 'sold', 'rented', 'hidden'];

const empty = {
  title: { th: '', en: '' },
  description: { th: '' },
  propertyType: 'house',
  listingType: 'sale',
  status: 'draft',
  price: { sale: undefined as number | undefined, rentMonthly: undefined as number | undefined, hidePrice: false },
  area: { usableSqm: undefined as number | undefined, landRai: 0, landNgan: 0, landWah: 0 },
  spec: { bedrooms: undefined as number | undefined, bathrooms: undefined as number | undefined, parking: undefined as number | undefined },
  location: { zone: '', address: { th: '' } },
  coverImageId: undefined as string | undefined,
  isFeatured: false,
};

export function PropertyFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    apiFetch<any>(`/admin/properties/${id}`).then((p) => {
      setForm({
        title: { th: p.title?.th ?? '', en: p.title?.en ?? '' },
        description: { th: p.description?.th ?? '' },
        propertyType: p.propertyType, listingType: p.listingType, status: p.status,
        price: { sale: p.price?.sale, rentMonthly: p.price?.rentMonthly, hidePrice: !!p.price?.hidePrice },
        area: { usableSqm: p.area?.usableSqm, landRai: p.area?.landRai ?? 0, landNgan: p.area?.landNgan ?? 0, landWah: p.area?.landWah ?? 0 },
        spec: { bedrooms: p.spec?.bedrooms, bathrooms: p.spec?.bathrooms, parking: p.spec?.parking },
        location: { zone: p.location?.zone ?? '', address: { th: p.location?.address?.th ?? '' } },
        coverImageId: p.coverImage?.mediaId,
        isFeatured: !!p.isFeatured,
      });
      setCoverUrl(p.coverImage?.url);
    });
  }, [id, isNew]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isNew) {
        await apiFetch('/admin/properties', { method: 'POST', body: JSON.stringify(form) });
      } else {
        await apiFetch(`/admin/properties/${id}`, { method: 'PATCH', body: JSON.stringify(form) });
      }
      navigate('/properties');
    } catch (err) {
      setError(err instanceof ApiClientError ? `${err.message}` : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{isNew ? 'เพิ่มทรัพย์' : 'แก้ไขทรัพย์'}</h1>
      <form onSubmit={onSubmit} className="bg-white p-6 border border-black/10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="ชื่อประกาศ (ไทย)">
            <input required value={form.title.th}
                   onChange={(e) => set({ title: { ...form.title, th: e.target.value } })}
                   className="input" />
          </Field>
          <Field label="ชื่อประกาศ (English)">
            <input value={form.title.en}
                   onChange={(e) => set({ title: { ...form.title, en: e.target.value } })}
                   className="input" />
          </Field>
        </div>

        <Field label="รายละเอียด">
          <textarea rows={3} value={form.description.th}
                    onChange={(e) => set({ description: { th: e.target.value } })} className="input" />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="ประเภททรัพย์">
            <select value={form.propertyType} onChange={(e) => set({ propertyType: e.target.value })} className="input">
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="ขาย/เช่า">
            <select value={form.listingType} onChange={(e) => set({ listingType: e.target.value })} className="input">
              {LISTING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="สถานะ">
            <select value={form.status} onChange={(e) => set({ status: e.target.value })} className="input">
              {STATUSES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ราคาขาย (บาท)">
            <input type="number" value={form.price.sale ?? ''}
                   onChange={(e) => set({ price: { ...form.price, sale: e.target.value ? Number(e.target.value) : undefined } })}
                   className="input" />
          </Field>
          <Field label="ค่าเช่า/เดือน (บาท)">
            <input type="number" value={form.price.rentMonthly ?? ''}
                   onChange={(e) => set({ price: { ...form.price, rentMonthly: e.target.value ? Number(e.target.value) : undefined } })}
                   className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Field label="พื้นที่ใช้สอย (ตร.ม.)">
            <input type="number" value={form.area.usableSqm ?? ''}
                   onChange={(e) => set({ area: { ...form.area, usableSqm: e.target.value ? Number(e.target.value) : undefined } })}
                   className="input" />
          </Field>
          <Field label="ห้องนอน">
            <input type="number" value={form.spec.bedrooms ?? ''}
                   onChange={(e) => set({ spec: { ...form.spec, bedrooms: e.target.value ? Number(e.target.value) : undefined } })}
                   className="input" />
          </Field>
          <Field label="ห้องน้ำ">
            <input type="number" value={form.spec.bathrooms ?? ''}
                   onChange={(e) => set({ spec: { ...form.spec, bathrooms: e.target.value ? Number(e.target.value) : undefined } })}
                   className="input" />
          </Field>
          <Field label="ที่จอดรถ">
            <input type="number" value={form.spec.parking ?? ''}
                   onChange={(e) => set({ spec: { ...form.spec, parking: e.target.value ? Number(e.target.value) : undefined } })}
                   className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ย่าน/ทำเล">
            <input value={form.location.zone}
                   onChange={(e) => set({ location: { ...form.location, zone: e.target.value } })} className="input" />
          </Field>
          <Field label="ที่อยู่แสดงผล">
            <input value={form.location.address.th}
                   onChange={(e) => set({ location: { ...form.location, address: { th: e.target.value } } })} className="input" />
          </Field>
        </div>

        <Field label="ภาพหน้าปก">
          <MediaUploader value={coverUrl} onChange={(mediaId, url) => { set({ coverImageId: mediaId }); setCoverUrl(url); }} />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} />
          แสดงเป็นทรัพย์แนะนำหน้าแรก
        </label>

        {error && <p className="text-red text-sm">{error}</p>}

        <div className="flex gap-3">
          <button disabled={busy} type="submit"
                  className="bg-red hover:bg-red-bright text-white px-6 py-2.5 text-xs uppercase tracking-[.14em] disabled:opacity-60">
            {busy ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
