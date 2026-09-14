import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface GalleryItem { mediaId: string; url: string }
interface MediaResult { id?: string; _id?: string; url: string }

export function MediaGalleryUploader({ value, onChange }: { value: GalleryItem[]; onChange: (items: GalleryItem[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setError('');
    const uploaded: GalleryItem[] = [];
    let failed = 0;
    for (const file of files) {
      try {
        const form = new FormData();
        form.append('file', file);
        const media = await apiFetch<MediaResult>('/admin/media', { method: 'POST', body: form });
        uploaded.push({ mediaId: (media as any)._id ?? (media as any).id, url: media.url });
      } catch {
        failed++;
      }
    }
    onChange([...value, ...uploaded]);
    if (failed) setError(`อัปโหลดไม่สำเร็จ ${failed} ไฟล์`);
    setBusy(false);
    e.target.value = '';
  }

  function remove(mediaId: string) {
    onChange(value.filter((v) => v.mediaId !== mediaId));
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((item) => (
            <div key={item.mediaId} className="relative">
              <img src={item.url} alt="" className="w-24 h-20 object-cover border border-black/10" />
              <button type="button" onClick={() => remove(item.mediaId)}
                      className="absolute -top-2 -right-2 bg-red text-white rounded-full w-5 h-5 text-xs leading-none flex items-center justify-center">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} className="text-sm" />
      {busy && <p className="text-xs text-muted mt-1">กำลังอัปโหลด...</p>}
      {error && <p className="text-xs text-red mt-1">{error}</p>}
    </div>
  );
}
