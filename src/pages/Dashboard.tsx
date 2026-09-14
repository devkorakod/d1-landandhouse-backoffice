import { useEffect, useState } from 'react';
import { apiFetchFull } from '@/lib/api';

export function DashboardPage() {
  const [stats, setStats] = useState<{ properties: number; leadsNew: number; projects: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [properties, leads, projects] = await Promise.all([
        apiFetchFull<any[]>('/admin/properties?limit=1'),
        apiFetchFull<any[]>('/admin/leads?status=new&limit=1'),
        apiFetchFull<any[]>('/admin/projects'),
      ]);
      setStats({
        properties: properties.meta?.total ?? 0,
        leadsNew: leads.meta?.total ?? 0,
        projects: projects.data.length,
      });
    })().catch(() => setStats({ properties: 0, leadsNew: 0, projects: 0 }));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">แดชบอร์ด</h1>
      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl">
        <Stat label="ทรัพย์ทั้งหมด" value={stats?.properties} />
        <Stat label="ลีดใหม่ (รอติดต่อ)" value={stats?.leadsNew} highlight />
        <Stat label="โครงการ" value={stats?.projects} />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value?: number; highlight?: boolean }) {
  return (
    <div className="bg-white p-6 border border-black/10">
      <p className="text-xs uppercase tracking-[.14em] text-muted mb-2">{label}</p>
      <p className={`text-3xl font-display ${highlight ? 'text-red' : ''}`}>{value ?? '—'}</p>
    </div>
  );
}
