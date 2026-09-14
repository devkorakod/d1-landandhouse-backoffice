import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MediaUploader } from '@/components/MediaUploader';

export function MediaLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState('');

  function load() {
    setLoading(true);
    const qs = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    apiFetch<any[]>(`/admin/media${qs}`).then(setItems).finally(() => setLoading(false));
  }
  useEffect(load, [folder]);

  async function remove(id: string) {
    if (!confirm('ยืนยันลบไฟล์นี้? ลบแล้วกู้คืนไม่ได้')) return;
    try {
      await apiFetch(`/admin/media/${id}`, { method: 'DELETE' });
      load();
    } catch {
      alert('ลบไม่สำเร็จ — ไฟล์นี้อาจถูกใช้งานอยู่ในทรัพย์/โครงการ');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">คลังสื่อ</h1>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} className="input w-40">
          <option value="">ทุกโฟลเดอร์</option>
          <option value="general">general</option>
          <option value="seed">seed</option>
        </select>
      </div>

      <div className="bg-white p-6 border border-black/10 mb-8 max-w-sm">
        <h2 className="text-sm font-medium mb-3">อัปโหลดไฟล์ใหม่</h2>
        <MediaUploader onChange={() => load()} />
      </div>

      {loading ? <p className="text-muted">กำลังโหลด...</p> : items.length === 0 ? (
        <p className="text-muted py-12 text-center">ยังไม่มีไฟล์ในคลังสื่อ</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((m) => (
            <div key={m._id} className="bg-white border border-black/10">
              <div className="aspect-square bg-white-deep overflow-hidden">
                <img src={m.url} alt={m.alt?.th ?? ''} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-[11px] text-muted truncate" title={m.originalName}>{m.originalName ?? m.filename}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted">{m.usageCount > 0 ? `ใช้อยู่ ${m.usageCount}` : 'ยังไม่ได้ใช้'}</span>
                  <button onClick={() => remove(m._id)} className="text-[11px] text-red hover:underline">ลบ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
