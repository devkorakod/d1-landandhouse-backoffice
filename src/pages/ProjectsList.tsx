import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export function ProjectsListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>('/admin/projects').then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">โครงการ</h1>
      <p className="text-muted text-sm mb-4">
        การสร้าง/แก้ไขโครงการเต็มรูปแบบยังไม่มีฟอร์มในหลังบ้าน (API พร้อมแล้วที่ /admin/projects) —
        นี่คือรายการอ่านอย่างเดียวสำหรับตอนนี้
      </p>
      {loading ? <p className="text-muted">กำลังโหลด...</p> : (
        <table className="w-full bg-white border border-black/10 text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-3">ชื่อโครงการ</th><th className="p-3">ประเภท</th><th className="p-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((pr) => (
              <tr key={pr._id} className="border-b border-black/5">
                <td className="p-3">{pr.name?.th}</td>
                <td className="p-3">{pr.projectType}</td>
                <td className="p-3">{pr.status}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted">ยังไม่มีโครงการ</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
