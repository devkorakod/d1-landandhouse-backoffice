import { useEffect, useState } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api';
import { MediaUploader } from '@/components/MediaUploader';

interface Section { type: string; visible: boolean; data: Record<string, any> }

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero (ภาพใหญ่หน้าแรก)',
  richText: 'เนื้อหา + รูปภาพ',
  ctaBanner: 'แบนเนอร์ปุ่มกดอย่างเดียว',
  leadForm: 'แบนเนอร์ฟอร์มติดต่อ',
  featuredProperties: 'ทรัพย์แนะนำ (อัตโนมัติ)',
  featuredProjects: 'โครงการแนะนำ (อัตโนมัติ)',
  latestProperties: 'ทรัพย์ประกาศใหม่ (อัตโนมัติ)',
};

const bi = (th = '') => ({ th, en: '' });

const NEW_SECTION_DEFAULTS: Record<string, Record<string, any>> = {
  hero: { eyebrow: bi('D1LANDANDHOUSE'), title: bi(), titleEm: bi(), subtitle: bi(), primaryCtaLabel: bi(), primaryCtaHref: '/properties', secondaryCtaLabel: bi(), secondaryCtaHref: '/contact', imageUrl: '' },
  richText: { eyebrow: bi(), heading: bi(), body: bi(), imageUrl: '', imagePosition: 'right' },
  ctaBanner: { heading: bi(), body: bi(), buttonLabel: bi(), buttonHref: '/properties' },
  leadForm: { eyebrow: bi(), heading: bi(), body: bi() },
  featuredProperties: { eyebrow: bi('Featured'), heading: bi('ทรัพย์แนะนำ'), limit: 4 },
  featuredProjects: { eyebrow: bi('Projects'), heading: bi('โครงการแนะนำ'), limit: 3 },
  latestProperties: { eyebrow: bi('New'), heading: bi('ทรัพย์ประกาศใหม่'), limit: 8 },
};

/** ค่าฟิลด์แปลได้ อาจเป็น string เดี่ยวแบบเก่า (ก่อนอัปเดต) หรือ {th,en} แบบใหม่ */
function asBilingual(v: any): { th: string; en: string } {
  if (v && typeof v === 'object') return { th: v.th ?? '', en: v.en ?? '' };
  return { th: v ?? '', en: '' };
}

export function PageEditorPage() {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [addType, setAddType] = useState('richText');

  useEffect(() => {
    apiFetch<{ sections: Section[] }>('/admin/pages/home').then((p) => setSections(p.sections));
  }, []);

  if (!sections) return <p className="text-muted">กำลังโหลด...</p>;

  function update(i: number, patch: Partial<Section>) {
    setSections((prev) => prev!.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    setSaved(false);
  }
  function updateData(i: number, patch: Record<string, any>) {
    update(i, { data: { ...sections![i].data, ...patch } });
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= sections!.length) return;
    setSections((prev) => {
      const arr = [...prev!];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
    setSaved(false);
  }
  function remove(i: number) {
    if (!confirm('ลบ section นี้?')) return;
    setSections((prev) => prev!.filter((_, idx) => idx !== i));
    setSaved(false);
  }
  function addSection() {
    setSections((prev) => [...prev!, { type: addType, visible: true, data: { ...NEW_SECTION_DEFAULTS[addType] } }]);
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      await apiFetch('/admin/pages/home', { method: 'PUT', body: JSON.stringify({ sections }) });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">หน้าแรก (Landing Page)</h1>
          <p className="text-muted text-sm mt-1">แก้ไขแล้วดูตัวอย่างสดด้านขวา จากนั้นกดบันทึกเพื่อให้ขึ้นเว็บจริง</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-700 text-sm">บันทึกแล้ว</span>}
          {error && <span className="text-red text-sm">{error}</span>}
          <button onClick={save} disabled={busy}
                  className="bg-red hover:bg-red-bright text-white px-6 py-2.5 text-xs uppercase tracking-[.14em] disabled:opacity-60">
            {busy ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        {/* ── รายการ section แก้ไขได้ ── */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div key={i} className="bg-white border border-black/10">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/10 bg-white-deep">
                <span className="text-sm font-medium flex-1">{SECTION_LABELS[section.type] ?? section.type}</span>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input type="checkbox" checked={section.visible} onChange={(e) => update(i, { visible: e.target.checked })} />
                  แสดง
                </label>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-xs text-muted hover:text-red disabled:opacity-30">▲</button>
                <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-xs text-muted hover:text-red disabled:opacity-30">▼</button>
                <button onClick={() => remove(i)} className="text-xs text-red hover:underline">ลบ</button>
              </div>
              <div className="p-4">
                <SectionFields type={section.type} data={section.data} onChange={(patch) => updateData(i, patch)} />
              </div>
            </div>
          ))}

          <div className="bg-white border border-black/10 p-4 flex items-center gap-3">
            <select value={addType} onChange={(e) => setAddType(e.target.value)} className="input flex-1">
              {Object.entries(SECTION_LABELS).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
            </select>
            <button onClick={addSection} className="bg-ink text-white px-5 py-2.5 text-xs uppercase tracking-[.14em] shrink-0">
              + เพิ่ม Section
            </button>
          </div>
        </div>

        {/* ── ตัวอย่างสด ── */}
        <div className="lg:sticky lg:top-6">
          <p className="text-xs uppercase tracking-[.14em] text-muted mb-2">ตัวอย่างสด (Live Preview)</p>
          <LivePreview sections={sections} />
        </div>
      </div>
    </div>
  );
}

function SectionFields({ type, data, onChange }: { type: string; data: Record<string, any>; onChange: (patch: Record<string, any>) => void }) {
  const f = (key: string) => ({
    value: data[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange({ [key]: e.target.value }),
  });
  /** ฟิลด์แปลได้ — แสดงคู่ TH/EN สองช่อง เก็บเป็น {th,en} */
  const bf = (key: string) => {
    const cur = asBilingual(data[key]);
    return {
      th: { value: cur.th, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [key]: { ...cur, th: e.target.value } }) },
      en: { value: cur.en, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [key]: { ...cur, en: e.target.value } }) },
    };
  };

  switch (type) {
    case 'hero':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Eyebrow (ไทย)"><input className="input" {...bf('eyebrow').th} /></Field>
            <Field label="Eyebrow (English)"><input className="input" {...bf('eyebrow').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="หัวข้อหลัก (ไทย)"><input className="input" {...bf('title').th} /></Field>
            <Field label="หัวข้อหลัก (English)"><input className="input" {...bf('title').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="หัวข้อเน้นสีแดง บรรทัด 2 (ไทย)"><input className="input" {...bf('titleEm').th} /></Field>
            <Field label="หัวข้อเน้นสีแดง บรรทัด 2 (English)"><input className="input" {...bf('titleEm').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="คำอธิบายสั้น (ไทย)"><textarea rows={2} className="input" {...bf('subtitle').th} /></Field>
            <Field label="คำอธิบายสั้น (English)"><textarea rows={2} className="input" {...bf('subtitle').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ปุ่มหลัก — ข้อความ (ไทย)"><input className="input" {...bf('primaryCtaLabel').th} /></Field>
            <Field label="ปุ่มหลัก — ข้อความ (English)"><input className="input" {...bf('primaryCtaLabel').en} /></Field>
          </div>
          <Field label="ปุ่มหลัก — ลิงก์"><input className="input" {...f('primaryCtaHref')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ปุ่มรอง — ข้อความ (ไทย)"><input className="input" {...bf('secondaryCtaLabel').th} /></Field>
            <Field label="ปุ่มรอง — ข้อความ (English)"><input className="input" {...bf('secondaryCtaLabel').en} /></Field>
          </div>
          <Field label="ปุ่มรอง — ลิงก์"><input className="input" {...f('secondaryCtaHref')} /></Field>
          <Field label="ภาพพื้นหลัง">
            <MediaUploader value={data.imageUrl} onChange={(_id, url) => onChange({ imageUrl: url })} />
          </Field>
        </div>
      );

    case 'richText':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Eyebrow (ไทย)"><input className="input" {...bf('eyebrow').th} /></Field>
            <Field label="Eyebrow (English)"><input className="input" {...bf('eyebrow').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="หัวข้อ (ไทย)"><input className="input" {...bf('heading').th} /></Field>
            <Field label="หัวข้อ (English)"><input className="input" {...bf('heading').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="เนื้อหา (ไทย)"><textarea rows={4} className="input" {...bf('body').th} /></Field>
            <Field label="เนื้อหา (English)"><textarea rows={4} className="input" {...bf('body').en} /></Field>
          </div>
          <Field label="ตำแหน่งรูปภาพ">
            <select className="input" {...f('imagePosition')}>
              <option value="right">ขวา</option>
              <option value="left">ซ้าย</option>
              <option value="none">ไม่มีรูป</option>
            </select>
          </Field>
          {data.imagePosition !== 'none' && (
            <Field label="รูปภาพ">
              <MediaUploader value={data.imageUrl} onChange={(_id, url) => onChange({ imageUrl: url })} />
            </Field>
          )}
        </div>
      );

    case 'ctaBanner':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="หัวข้อ (ไทย)"><input className="input" {...bf('heading').th} /></Field>
            <Field label="หัวข้อ (English)"><input className="input" {...bf('heading').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="เนื้อหา (ไทย)"><textarea rows={2} className="input" {...bf('body').th} /></Field>
            <Field label="เนื้อหา (English)"><textarea rows={2} className="input" {...bf('body').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ปุ่ม — ข้อความ (ไทย)"><input className="input" {...bf('buttonLabel').th} /></Field>
            <Field label="ปุ่ม — ข้อความ (English)"><input className="input" {...bf('buttonLabel').en} /></Field>
          </div>
          <Field label="ปุ่ม — ลิงก์"><input className="input" {...f('buttonHref')} /></Field>
        </div>
      );

    case 'leadForm':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Eyebrow (ไทย)"><input className="input" {...bf('eyebrow').th} /></Field>
            <Field label="Eyebrow (English)"><input className="input" {...bf('eyebrow').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="หัวข้อ (ไทย)"><input className="input" {...bf('heading').th} /></Field>
            <Field label="หัวข้อ (English)"><input className="input" {...bf('heading').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="เนื้อหา (ไทย)"><textarea rows={2} className="input" {...bf('body').th} /></Field>
            <Field label="เนื้อหา (English)"><textarea rows={2} className="input" {...bf('body').en} /></Field>
          </div>
          <p className="text-xs text-muted">ฟอร์มติดต่อจริงจะแสดงคู่กันอัตโนมัติ ไม่ต้องตั้งค่าเพิ่ม</p>
        </div>
      );

    case 'featuredProperties':
    case 'featuredProjects':
    case 'latestProperties':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Eyebrow (ไทย)"><input className="input" {...bf('eyebrow').th} /></Field>
            <Field label="Eyebrow (English)"><input className="input" {...bf('eyebrow').en} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="หัวข้อ (ไทย)"><input className="input" {...bf('heading').th} /></Field>
            <Field label="หัวข้อ (English)"><input className="input" {...bf('heading').en} /></Field>
          </div>
          <Field label="จำนวนที่แสดง">
            <input type="number" className="input" value={data.limit ?? ''}
                   onChange={(e) => onChange({ limit: Number(e.target.value) })} />
          </Field>
          <p className="text-xs text-muted">ดึงข้อมูลจริงจากทรัพย์/โครงการในระบบอัตโนมัติ แก้ได้แค่หัวข้อกับจำนวน</p>
        </div>
      );

    default:
      return <p className="text-xs text-muted">ยังไม่มีฟอร์มแก้ไขสำหรับ section ชนิดนี้</p>;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="block text-muted mb-1 text-xs">{label}</span>{children}</label>;
}

/* ── Live preview: จำลองหน้าตาจริงแบบย่อส่วน ใช้โทนสีเดียวกับเว็บจริง (ดำ/ขาว/แดง) ── */
function LivePreview({ sections }: { sections: Section[] }) {
  return (
    <div className="bg-ink text-white border border-black/10 overflow-hidden" style={{ fontSize: '11px' }}>
      {sections.filter((s) => s.visible).map((s, i) => <PreviewSection key={i} section={s} />)}
      {sections.every((s) => !s.visible) && <p className="p-6 text-white/40 text-center">ไม่มี section ที่แสดงอยู่</p>}
    </div>
  );
}

/** preview แสดงเวอร์ชันไทยเสมอ (ไม่ว่าจะกรอก EN ไว้หรือไม่ก็ตาม) เพื่อความเรียบง่าย */
function bt(v: any): string {
  return v && typeof v === 'object' ? (v.th ?? '') : (v ?? '');
}

function PreviewSection({ section }: { section: Section }) {
  const d = section.data ?? {};
  switch (section.type) {
    case 'hero':
      return (
        <div className="p-5 pt-10 pb-8 bg-ink-soft relative" style={{
          backgroundImage: d.imageUrl ? `linear-gradient(rgba(11,11,12,.5),rgba(11,11,12,.5)), url(${d.imageUrl})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          {bt(d.eyebrow) && <p className="text-red text-[9px] uppercase tracking-[.14em] mb-2">{bt(d.eyebrow)}</p>}
          <p className="font-display text-lg leading-tight mb-1">{bt(d.title) || 'หัวข้อหลัก'}</p>
          {bt(d.titleEm) && <p className="font-display text-lg leading-tight text-red-bright mb-2">{bt(d.titleEm)}</p>}
          {bt(d.subtitle) && <p className="text-white/70 text-[10px] mb-3 line-clamp-2">{bt(d.subtitle)}</p>}
          <div className="flex gap-2">
            {bt(d.primaryCtaLabel) && <span className="bg-red text-white px-3 py-1.5 text-[9px] uppercase">{bt(d.primaryCtaLabel)}</span>}
            {bt(d.secondaryCtaLabel) && <span className="border border-red text-red-bright px-3 py-1.5 text-[9px] uppercase">{bt(d.secondaryCtaLabel)}</span>}
          </div>
        </div>
      );
    case 'richText':
      return (
        <div className="p-5 border-t border-white/10">
          <div className={`flex gap-4 ${d.imagePosition === 'left' ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              {bt(d.eyebrow) && <p className="text-red text-[9px] uppercase tracking-[.14em] mb-1">{bt(d.eyebrow)}</p>}
              <p className="font-display text-sm mb-1">{bt(d.heading) || 'หัวข้อเนื้อหา'}</p>
              <p className="text-white/60 text-[10px] line-clamp-3">{bt(d.body)}</p>
            </div>
            {d.imagePosition !== 'none' && d.imageUrl && (
              <img src={d.imageUrl} alt="" className="w-16 h-16 object-cover shrink-0" />
            )}
          </div>
        </div>
      );
    case 'ctaBanner':
      return (
        <div className="p-5 bg-white text-ink text-center border-t border-white/10">
          <p className="font-display text-sm mb-1">{bt(d.heading) || 'หัวข้อ CTA'}</p>
          {bt(d.body) && <p className="text-black/60 text-[10px] mb-2 line-clamp-2">{bt(d.body)}</p>}
          {bt(d.buttonLabel) && <span className="inline-block bg-red text-white px-3 py-1.5 text-[9px] uppercase">{bt(d.buttonLabel)}</span>}
        </div>
      );
    case 'leadForm':
      return (
        <div className="p-5 bg-white text-ink border-t border-white/10">
          {bt(d.eyebrow) && <p className="text-red text-[9px] uppercase tracking-[.14em] mb-1">{bt(d.eyebrow)}</p>}
          <p className="font-display text-sm mb-1">{bt(d.heading) || 'ฟอร์มติดต่อ'}</p>
          <p className="text-black/50 text-[10px] mb-2 line-clamp-2">{bt(d.body)}</p>
          <div className="bg-ink text-white/40 text-[9px] p-2 text-center">[ ฟอร์มติดต่อจริง ]</div>
        </div>
      );
    case 'featuredProperties':
    case 'latestProperties':
      return (
        <div className="p-5 border-t border-white/10">
          {bt(d.eyebrow) && <p className="text-red text-[9px] uppercase tracking-[.14em] mb-1">{bt(d.eyebrow)}</p>}
          <p className="font-display text-sm mb-2">{bt(d.heading) || 'ทรัพย์'}</p>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: Math.min(4, d.limit ?? 4) }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/10" />
            ))}
          </div>
          <p className="text-white/30 text-[9px] mt-1">ดึงทรัพย์จริง {d.limit ?? 4} รายการอัตโนมัติ</p>
        </div>
      );
    case 'featuredProjects':
      return (
        <div className="p-5 border-t border-white/10">
          {bt(d.eyebrow) && <p className="text-red text-[9px] uppercase tracking-[.14em] mb-1">{bt(d.eyebrow)}</p>}
          <p className="font-display text-sm mb-2">{bt(d.heading) || 'โครงการ'}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: Math.min(3, d.limit ?? 3) }).map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-white/10" />
            ))}
          </div>
          <p className="text-white/30 text-[9px] mt-1">ดึงโครงการจริง {d.limit ?? 3} รายการอัตโนมัติ</p>
        </div>
      );
    default:
      return null;
  }
}
