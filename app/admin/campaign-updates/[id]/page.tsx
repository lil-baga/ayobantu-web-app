import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../_components/AdminNav';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignUpdateDetailPage({ params }: Props) {
  const staff = await requireStaff();
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: update } = await supabase
    .from('campaign_updates')
    .select(`
      id, title, body, image_urls, disbursement_id, created_at,
      campaigns (title, slug),
      staff_profiles (name)
    `)
    .eq('id', id)
    .single();

  if (!update) notFound();

  const campaign = (update.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;
  const author = (update.staff_profiles as Array<{ name: string }> | null)?.[0] || null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="updates" staff={{ name: staff.name, role: staff.role }} />
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link 
            href="/admin/campaign-updates" 
            className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition inline-flex items-center gap-1 mb-3"
          >
            ← Kembali ke Update Kampanye
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Detail Update Kampanye</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{campaign?.title}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Kampanye Target</div>
              <div className="font-semibold text-base text-gray-900 dark:text-white">{campaign?.title}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dibuat Oleh</div>
              <div className="font-medium text-gray-900 dark:text-white">{author?.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tanggal Publikasi</div>
              <div className="font-medium text-gray-700 dark:text-gray-300">{new Date(update.created_at).toLocaleString('id-ID')}</div>
            </div>
            {update.disbursement_id && (
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">ID Pencairan Terkait</div>
                <Link 
                  href={`/admin/disbursements/${update.disbursement_id}`}
                  className="font-mono text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                >
                  {update.disbursement_id}
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Judul Update</div>
            <h2 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white leading-tight">{update.title}</h2>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Isi Kabar</div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{update.body}</p>
            </div>
          </div>

          {update.image_urls && update.image_urls.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Lampiran Gambar</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {update.image_urls.map((url: string, i: number) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noopener" 
                    className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-900 bg-slate-50 dark:bg-gray-800/40 text-xs font-semibold text-blue-600 dark:text-blue-400 transition"
                  >
                    📷 Gambar {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
