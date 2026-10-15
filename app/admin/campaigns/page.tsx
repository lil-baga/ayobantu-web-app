import { getStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminNav from '../_components/AdminNav';

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="campaigns" staff={{ name: staff.name, role: staff.role }} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kampanye</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola semua kampanye penggalangan dana</p>
          </div>
          {staff.role === 'admin' && (
            <Link 
              href="/admin/campaigns/new"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition text-sm flex items-center gap-2"
            >
              <span>+</span> Buat Kampanye
            </Link>
          )}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3.5">Judul</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {campaigns?.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{c.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.beneficiary_name}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">{c.slug}</td>
                    <td className="px-5 py-4 font-bold text-sm">Rp{(c.target_amount / 1000).toLocaleString()}k</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-block border ${
                        c.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        c.status === 'draft' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' :
                        'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3 justify-end items-center">
                        <Link 
                          href={`/kampanye/${c.slug}`}
                          target="_blank"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                        >
                          Lihat →
                        </Link>
                        {staff.role === 'admin' && (
                          <Link 
                            href={`/admin/campaigns/${c.id}/edit`}
                            className="text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!campaigns || campaigns.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                      Belum ada kampanye. Buat kampanye pertama Anda.
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
