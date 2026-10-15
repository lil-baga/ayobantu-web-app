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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav currentPath="disbursements" staff={{ name: staff.name, role: staff.role }} />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Pencairan Dana</h2>
          <Link 
            href="/admin/disbursements/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
          >
            + Buat Pencairan
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Kampanye</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Penerima</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {disbursements?.map((d) => {
                const campaign = (d.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;
                const creator = (d.staff_profiles as Array<{ name: string }> | null)?.[0] || null;

                return (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-4 py-3">
                      <div>{campaign?.title}</div>
                      <div className="text-xs text-gray-500">oleh {creator?.name}</div>
                    </td>
                    <td className="px-4 py-3">{d.category}</td>
                    <td className="px-4 py-3">{d.recipient_name}</td>
                    <td className="px-4 py-3 font-medium">Rp{(d.amount / 1000).toLocaleString()}k</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        d.status === 'reported' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        d.status === 'disbursed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {d.disbursed_at 
                        ? new Date(d.disbursed_at).toLocaleDateString('id-ID')
                        : new Date(d.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/admin/disbursements/${d.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
