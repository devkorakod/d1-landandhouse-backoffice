import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface MediaResult { id?: string; _id?: string; url: string }

export function MediaUploader({ value, onChange }: { value?: string; onChange: (mediaId: string, url: string) => void }) {
  const [preview, setPreview] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const media = await apiFetch<MediaResult>('/admin/media', { method: 'POST', body: form });
      setPreview(media.url);
      onChange((media as any)._id ?? (media as any).id, media.url);
    } catch {
      setError('อัปโหลดไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {preview && (
        <img src={preview} alt="" className="w-40 h-28 object-cover border border-black/10 mb-2" />
      )}
      <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="text-sm" />
      {busy && <p className="text-xs text-muted mt-1">กำลังอัปโหลด...</p>}
      {error && <p className="text-xs text-red mt-1">{error}</p>}
    </div>
  );
}
