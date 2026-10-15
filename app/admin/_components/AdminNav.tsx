import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface Props {
  currentPath: 'dashboard' | 'campaigns' | 'donations' | 'disbursements' | 'updates' | 'reports';
  staff?: {
    name: string;
    role: string;
  };
}

export default function AdminNav({ currentPath, staff }: Props) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/admin' },
    { key: 'campaigns', label: 'Kampanye', href: '/admin/campaigns' },
    { key: 'donations', label: 'Donasi', href: '/admin/donations' },
    { key: 'disbursements', label: 'Pencairan', href: '/admin/disbursements' },
    { key: 'updates', label: 'Update', href: '/admin/campaign-updates' },
    { key: 'reports', label: 'Laporan', href: '/admin/reports' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Portal Admin
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  currentPath === item.key
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            MODE LOKAL
          </span>
          {staff && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{staff.name}</span>
              <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                {staff.role}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
