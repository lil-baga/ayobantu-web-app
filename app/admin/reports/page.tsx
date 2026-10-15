import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import ReportActions from './_components/ReportActions';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  await requireStaff(['admin']);

  const supabase = createAdminClient();
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id, reason, description, status, created_at,
      campaigns (title, slug),
      staff_profiles (name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">AyoBantu Admin</h1>
            <div className="flex gap-4 text-sm">
              <Link href="/admin/campaigns" className="text-gray-600 dark:text-gray-400">Kampanye</Link>
              <Link href="/admin/donations" className="text-gray-600 dark:text-gray-400">Donasi</Link>
              <Link href="/admin/disbursements" className="text-gray-600 dark:text-gray-400">Pencairan</Link>
              <Link href="/admin/campaign-updates" className="text-gray-600 dark:text-gray-400">Update</Link>
              <Link href="/admin/reports" className="font-medium text-blue-600">Laporan</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Laporan Kampanye</h2>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Kampanye</th>
                <th className="px-4 py-3 font-medium">Alasan</th>
                <th className="px-4 py-3 font-medium">Deskripsi</th>
                <th className="px-4 py-3 font-medium">Dilaporkan Oleh</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports?.map((r) => {
                const campaign = (r.campaigns as Array<{ title: string }> | null)?.[0] || null;
                const reporter = (r.staff_profiles as Array<{ name: string }> | null)?.[0] || null;
                return (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-4 py-3">{campaign?.title}</td>
                    <td className="px-4 py-3">{r.reason}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{r.description}</td>
                    <td className="px-4 py-3">{reporter?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        r.status === 'closed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        r.status === 'reviewed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <ReportActions reportId={r.id} status={r.status} />
                    </td>
                  </tr>
                );
              })}
              {(!reports || reports.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Belum ada laporan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}