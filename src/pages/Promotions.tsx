import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export function PromotionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>('/admin/promotions').then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">โปรโมชั่น</h1>
      <p className="text-muted text-sm mb-4">
        ฟอร์มสร้าง/แก้ไขโปรโมชั่นยังไม่มีในหลังบ้าน (API พร้อมแล้วที่ /admin/promotions) — รายการอ่านอย่างเดียวสำหรับตอนนี้
      </p>
      {loading ? <p className="text-muted">กำลังโหลด...</p> : (
        <table className="w-full bg-white border border-black/10 text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-3">ชื่อ</th><th className="p-3">ส่วนลด</th><th className="p-3">ช่วงเวลา</th><th className="p-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((pr) => (
              <tr key={pr._id} className="border-b border-black/5">
                <td className="p-3">{pr.title?.th}</td>
                <td className="p-3">{pr.discountType === 'percentage' ? `${pr.discountValue}%` : pr.discountValue?.toLocaleString('th-TH')}</td>
                <td className="p-3">{new Date(pr.startAt).toLocaleDateString('th-TH')} – {new Date(pr.endAt).toLocaleDateString('th-TH')}</td>
                <td className="p-3">{pr.isActive ? 'เปิดใช้งาน' : 'ปิด'}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted">ยังไม่มีโปรโมชั่น</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
