import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import AdminNav from '../_components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminDisbursementsPage() {
  const staff = await requireStaff(['admin', 'finance']);

  const supabase = createAdminClient();
  const { data: disbursements } = await supabase
    .from('disbursements')
    .select(`
      id, amount, category, description, recipient_name, 
      status, disbursed_at, created_at,
      campaigns (title, slug),
      staff_profiles (name)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="disbursements" staff={{ name: staff.name, role: staff.role }} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pencairan Dana</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola penyaluran dana ke penerima manfaat</p>
          </div>
          <Link 
            href="/admin/disbursements/new"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition text-sm flex items-center gap-2"
          >
            <span>+</span> Buat Pencairan
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3.5">Kampanye</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Penerima</th>
                  <th className="px-5 py-3.5">Jumlah</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {disbursements?.map((d) => {
                  const campaign = (d.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;
                  const creator = (d.staff_profiles as Array<{ name: string }> | null)?.[0] || null;

                  return (
                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">{campaign?.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">oleh {creator?.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {d.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-sm">{d.recipient_name}</td>
                      <td className="px-5 py-4 font-bold">Rp{(d.amount / 1000).toLocaleString()}k</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-block border ${
                          d.status === 'reported' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                          d.status === 'disbursed' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400">
                        {d.disbursed_at 
                          ? new Date(d.disbursed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link 
                          href={`/admin/disbursements/${d.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!disbursements || disbursements.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                      Belum ada pencairan dana.
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
