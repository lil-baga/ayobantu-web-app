import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import AdminNav from '../_components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function CampaignUpdatesPage() {
  const staff = await requireStaff();

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="updates" staff={{ name: staff.name, role: staff.role }} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Update Kampanye</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publikasi perkembangan dan transparansi kepada donatur</p>
          </div>
          <Link
            href="/admin/campaign-updates/new"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition text-sm flex items-center gap-2"
          >
            <span>+</span> Buat Update
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3.5">Kampanye</th>
                  <th className="px-5 py-3.5">Judul Update</th>
                  <th className="px-5 py-3.5">Dibuat Oleh</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {updates?.map((u) => {
                  const campaign = (u.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;
                  const author = (u.staff_profiles as Array<{ name: string }> | null)?.[0] || null;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">{campaign?.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-sm max-w-xs truncate">{u.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{u.body}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">{author?.name}</td>
                      <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link 
                          href={`/admin/campaign-updates/${u.id}`} 
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!updates || updates.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                      Belum ada update kampanye.
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
