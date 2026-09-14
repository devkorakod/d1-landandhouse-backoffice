import { useEffect, useState } from 'react';
import { apiFetch, apiFetchFull } from '@/lib/api';

const STATUSES = [
  { key: 'new', label: 'ลีดใหม่' },
  { key: 'contacted', label: 'ติดต่อแล้ว' },
  { key: 'viewing_scheduled', label: 'นัดชม' },
  { key: 'negotiating', label: 'เจรจา' },
  { key: 'won', label: 'สำเร็จ' },
  { key: 'lost', label: 'ไม่สำเร็จ' },
];

export function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await apiFetchFull<any[]>('/admin/leads?limit=100');
    setLeads(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function moveStatus(id: string, status: string) {
    let lostReason: string | undefined;
    if (status === 'lost') {
      lostReason = prompt('เหตุผลที่ปิดไม่สำเร็จ (budget/location/timing/bought_elsewhere/unreachable/not_serious/other)', 'other') ?? undefined;
      if (!lostReason) return;
    }
    setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    try {
      await apiFetch(`/admin/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, lostReason }) });
    } catch {
      load();
    }
  }

  if (loading) return <p className="text-muted">กำลังโหลด...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">ลีด (CRM)</h1>
      <div className="grid grid-cols-6 gap-3 overflow-x-auto">
        {STATUSES.map((col) => (
          <div key={col.key} className="bg-white border border-black/10 min-h-[200px]">
            <div className="px-3 py-2 border-b border-black/10 text-xs uppercase tracking-wide text-muted flex justify-between">
              <span>{col.label}</span>
              <span>{leads.filter((l) => l.status === col.key).length}</span>
            </div>
            <div className="p-2 space-y-2">
              {leads.filter((l) => l.status === col.key).map((l) => (
                <div key={l._id} className="border border-black/10 p-2.5 text-xs bg-white-deep">
                  <p className="font-medium">{l.name}</p>
                  <p className="text-muted">{l.phone}</p>
                  {l.propertySnapshot?.title && <p className="text-muted mt-1 line-clamp-1">{l.propertySnapshot.title.th}</p>}
                  <select value={l.status} onChange={(e) => moveStatus(l._id, e.target.value)}
                          className="mt-2 w-full text-xs border border-black/15 px-1 py-1">
                    {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
