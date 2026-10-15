import { getStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignsPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const supabase = await createAdminClient();
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">AyoBantu Admin</h1>
            <div className="flex gap-4 text-sm">
              <Link href="/admin/campaigns" className="font-medium text-blue-600">Kampanye</Link>
              <Link href="/admin/donations" className="text-gray-600 dark:text-gray-400">Donasi</Link>
              <Link href="/admin/disbursements" className="text-gray-600 dark:text-gray-400">Pencairan</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              MODE LOKAL
            </span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {staff.name} ({staff.role})
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Kampanye</h2>
          {staff.role === 'admin' && (
            <Link 
              href="/admin/campaigns/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
            >
              + Buat Kampanye
            </Link>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {campaigns?.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.slug}</td>
                  <td className="px-4 py-3">Rp{(c.target_amount / 1000).toLocaleString()}k</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      c.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      c.status === 'draft' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link 
                        href={`/kampanye/${c.slug}`}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Lihat
                      </Link>
                      {staff.role === 'admin' && (
                        <Link 
                          href={`/admin/campaigns/${c.id}/edit`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
