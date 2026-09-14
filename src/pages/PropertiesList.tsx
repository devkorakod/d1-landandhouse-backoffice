import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetchFull, apiFetch } from '@/lib/api';

export function PropertiesListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await apiFetchFull<any[]>('/admin/properties?limit=50');
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('ยืนยันลบทรัพย์นี้? (ย้ายไปถังขยะ)')) return;
    await apiFetch(`/admin/properties/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">ทรัพย์</h1>
        <Link to="/properties/new" className="bg-red hover:bg-red-bright text-white text-xs uppercase tracking-[.14em] px-5 py-2.5">
          + เพิ่มทรัพย์
        </Link>
      </div>
      {loading ? <p className="text-muted">กำลังโหลด...</p> : (
        <table className="w-full bg-white border border-black/10 text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-muted">
              <th className="p-3">รหัส</th><th className="p-3">ชื่อ</th><th className="p-3">ประเภท</th>
              <th className="p-3">สถานะ</th><th className="p-3">ราคา</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-black/5">
                <td className="p-3">{p.code}</td>
                <td className="p-3">{p.title?.th}</td>
                <td className="p-3">{p.propertyType}</td>
                <td className="p-3"><StatusBadge status={p.status} /></td>
                <td className="p-3">{p.price?.sale?.toLocaleString('th-TH') ?? p.price?.rentMonthly?.toLocaleString('th-TH') ?? '-'}</td>
                <td className="p-3 text-right space-x-3">
                  <Link to={`/properties/${p.id}`} className="text-red hover:underline">แก้ไข</Link>
                  <button onClick={() => remove(p.id)} className="text-muted hover:text-red">ลบ</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted">ยังไม่มีทรัพย์</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === 'published' ? 'bg-green-600' : status === 'draft' ? 'bg-muted' : 'bg-red';
  return <span className={`text-white text-xs px-2 py-0.5 ${color}`}>{status}</span>;
}
