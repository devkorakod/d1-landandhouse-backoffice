import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';

export function PromotionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch<any[]>('/admin/promotions').then(setItems).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function remove(id: string) {
    if (!confirm('ยืนยันลบโปรโมชั่นนี้?')) return;
    await apiFetch(`/admin/promotions/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">โปรโมชั่น</h1>
        <Link to="/promotions/new" className="bg-red hover:bg-red-bright text-white text-xs uppercase tracking-[.14em] px-5 py-2.5">
          + เพิ่มโปรโมชั่น
        </Link>
      </div>
      {loading ? <p className="text-muted">กำลังโหลด...</p> : (
        <table className="w-full bg-white border border-black/10 text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-3">ชื่อ</th><th className="p-3">ส่วนลด</th><th className="p-3">ช่วงเวลา</th>
              <th className="p-3">สถานะ</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((pr) => (
              <tr key={pr._id} className="border-b border-black/5">
                <td className="p-3">{pr.title?.th}</td>
                <td className="p-3">{pr.discountType === 'percentage' ? `${pr.discountValue}%` : pr.discountValue?.toLocaleString('th-TH')}</td>
                <td className="p-3">{new Date(pr.startAt).toLocaleDateString('th-TH')} – {new Date(pr.endAt).toLocaleDateString('th-TH')}</td>
                <td className="p-3">{pr.isActive ? 'เปิดใช้งาน' : 'ปิด'}</td>
                <td className="p-3 text-right space-x-3">
                  <Link to={`/promotions/${pr._id}`} className="text-red hover:underline">แก้ไข</Link>
                  <button onClick={() => remove(pr._id)} className="text-muted hover:text-red">ลบ</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted">ยังไม่มีโปรโมชั่น</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
