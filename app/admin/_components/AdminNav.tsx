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
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            AyoBantu Admin
          </Link>
          <div className="flex gap-4 text-sm">
            <Link
              href="/admin"
              className={currentPath === 'dashboard' ? 'font-medium text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/campaigns"
              className={currentPath === 'campaigns' ? 'font-medium text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}
            >
              Kampanye
            </Link>
            <Link
              href="/admin/donations"
              className={currentPath === 'donations' ? 'font-medium text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}
            >
              Donasi
            </Link>
            <Link
              href="/admin/disbursements"
              className={currentPath === 'disbursements' ? 'font-medium text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}
            >
              Pencairan
            </Link>
            <Link
              href="/admin/campaign-updates"
              className={currentPath === 'updates' ? 'font-medium text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}
            >
              Update
            </Link>
            <Link
              href="/admin/reports"
              className={currentPath === 'reports' ? 'font-medium text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}
            >
              Laporan
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            MODE LOKAL
          </span>
          {staff && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-800 dark:text-gray-200">{staff.name}</span>{' '}
              <span className="uppercase text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {staff.role}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
