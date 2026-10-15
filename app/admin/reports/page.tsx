import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import ReportActions from './_components/ReportActions';
import AdminNav from '../_components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const staff = await requireStaff(['admin']);

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="reports" staff={{ name: staff.name, role: staff.role }} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Laporan Kampanye</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tinjau dan tindak lanjuti laporan dari pengguna</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3.5">Kampanye</th>
                  <th className="px-5 py-3.5">Alasan</th>
                  <th className="px-5 py-3.5">Deskripsi</th>
                  <th className="px-5 py-3.5">Dilaporkan Oleh</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reports?.map((r) => {
                  const campaign = (r.campaigns as Array<{ title: string }> | null)?.[0] || null;
                  const reporter = (r.staff_profiles as Array<{ name: string }> | null)?.[0] || null;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">{campaign?.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {r.reason}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <div className="text-sm truncate">{r.description}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">{reporter?.name}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-block border ${
                          r.status === 'closed' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                          r.status === 'reviewed' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ReportActions reportId={r.id} status={r.status} />
                      </td>
                    </tr>
                  );
                })}
                {(!reports || reports.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                      Belum ada laporan kampanye.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
