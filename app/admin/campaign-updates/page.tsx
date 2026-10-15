import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import AdminNav from '../_components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function CampaignUpdatesPage() {
  const staff = await requireStaff(['admin', 'finance']);

  const supabase = createAdminClient();
  const { data: updates } = await supabase
    .from('campaign_updates')
    .select(`
      id, title, body, image_urls, created_at,
      campaigns (title, slug),
      staff_profiles (name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav currentPath="updates" staff={{ name: staff.name, role: staff.role }} />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Update Kampanye</h2>
          <Link
            href="/admin/campaign-updates/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
          >
            + Buat Update
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Kampanye</th>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Dibuat Oleh</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {updates?.map((u) => {
                const campaign = (u.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;
                const author = (u.staff_profiles as Array<{ name: string }> | null)?.[0] || null;
                return (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-4 py-3">{campaign?.title}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{u.title}</td>
                    <td className="px-4 py-3">{author?.name}</td>
                    <td className="px-4 py-3 text-xs">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/campaign-updates/${u.id}`} className="text-xs text-blue-600 hover:underline">Detail</Link>
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