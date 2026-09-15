import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetchFull } from '@/lib/api';

export function DashboardPage() {
  const [stats, setStats] = useState<{ properties: number; leadsNew: number; projects: number } | null>(null);
  const [topProperties, setTopProperties] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [properties, leads, projects, allProperties] = await Promise.all([
        apiFetchFull<any[]>('/admin/properties?limit=1'),
        apiFetchFull<any[]>('/admin/leads?status=new&limit=1'),
        apiFetchFull<any[]>('/admin/projects'),
        apiFetchFull<any[]>('/admin/properties?limit=50'),
      ]);
      setStats({
        properties: properties.meta?.total ?? 0,
        leadsNew: leads.meta?.total ?? 0,
        projects: projects.data.length,
      });
      setTopProperties(allProperties.data);
    })().catch(() => setStats({ properties: 0, leadsNew: 0, projects: 0 }));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">แดชบอร์ด</h1>
      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mb-10">
        <Stat label="ทรัพย์ทั้งหมด" value={stats?.properties} />
        <Stat label="ลีดใหม่ (รอติดต่อ)" value={stats?.leadsNew} highlight />
        <Stat label="โครงการ" value={stats?.projects} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <StatsBarChart title="ทรัพย์ยอดนิยม (เข้าชมสูงสุด)" properties={topProperties} metric="views" />
        <StatsBarChart title="ทรัพย์ที่มีลีดมากที่สุด" properties={topProperties} metric="leads" />
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

function StatsBarChart({ title, properties, metric }: {
  title: string; properties: any[]; metric: 'views' | 'leads';
}) {
  const top = [...properties]
    .sort((a, b) => (b.stats?.[metric] ?? 0) - (a.stats?.[metric] ?? 0))
    .slice(0, 8);
  const max = Math.max(1, ...top.map((p) => p.stats?.[metric] ?? 0));

  return (
    <div className="bg-white p-6 border border-black/10">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {top.length === 0 || max === 0 ? (
        <p className="text-muted text-sm">ยังไม่มีข้อมูล</p>
      ) : (
        <div className="space-y-3">
          {top.map((p) => {
            const value = p.stats?.[metric] ?? 0;
            return (
              <Link key={p.id} to={`/properties/${p.id}`} className="block group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="truncate pr-2 group-hover:text-red">{p.title?.th}</span>
                  <span className="text-muted shrink-0 tabular-nums">{value}</span>
                </div>
                <div className="h-1.5 bg-black/5">
                  <div className="h-full bg-red" style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
