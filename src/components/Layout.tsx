import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

const NAV = [
  { to: '/', label: 'แดชบอร์ด', end: true },
  { to: '/pages/home', label: 'หน้าเว็บ' },
  { to: '/properties', label: 'ทรัพย์' },
  { to: '/projects', label: 'โครงการ' },
  { to: '/leads', label: 'ลีด' },
  { to: '/promotions', label: 'โปรโมชั่น' },
  { to: '/media', label: 'คลังสื่อ' },
  { to: '/settings', label: 'ตั้งค่า' },
];

export function Layout() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-ink text-white flex flex-col shrink-0">
        <div className="px-5 py-6 font-display text-base tracking-[.08em] border-b border-white/10 whitespace-nowrap overflow-hidden text-ellipsis">
          D1<span className="text-red">·</span>LANDANDHOUSE
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm ${isActive ? 'bg-red text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user.role === 'owner' && (
            <NavLink to="/users" className={({ isActive }) =>
              `block px-5 py-2.5 text-sm ${isActive ? 'bg-red text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
              ผู้ใช้งาน (Owner)
            </NavLink>
          )}
        </nav>
        <div className="p-5 border-t border-white/10 text-xs">
          <p className="text-white/60">{user.name}</p>
          <p className="text-white/40 mb-3">{user.role}</p>
          <button onClick={logout} className="text-red-bright hover:underline">ออกจากระบบ</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
