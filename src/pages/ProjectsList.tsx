import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';

export function ProjectsListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch<any[]>('/admin/projects').then(setItems).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function remove(id: string) {
    if (!confirm('ยืนยันลบโครงการนี้? (ย้ายไปถังขยะ)')) return;
    await apiFetch(`/admin/projects/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">โครงการ</h1>
        <Link to="/projects/new" className="bg-red hover:bg-red-bright text-white text-xs uppercase tracking-[.14em] px-5 py-2.5">
          + เพิ่มโครงการ
        </Link>
      </div>
      {loading ? <p className="text-muted">กำลังโหลด...</p> : (
        <table className="w-full bg-white border border-black/10 text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-3">ชื่อโครงการ</th><th className="p-3">ประเภท</th><th className="p-3">สถานะ</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((pr) => (
              <tr key={pr._id} className="border-b border-black/5">
                <td className="p-3">{pr.name?.th}</td>
                <td className="p-3">{pr.projectType}</td>
                <td className="p-3">{pr.status}</td>
                <td className="p-3 text-right space-x-3">
                  <Link to={`/projects/${pr._id}`} className="text-red hover:underline">แก้ไข</Link>
                  <button onClick={() => remove(pr._id)} className="text-muted hover:text-red">ลบ</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted">ยังไม่มีโครงการ</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
