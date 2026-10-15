import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignUpdateDetailPage({ params }: Props) {
  await requireStaff();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin/campaign-updates" className="text-blue-600 hover:underline">
            ← Kembali ke Update Kampanye
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Detail Update Kampanye</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Kampanye</div>
            <div className="font-medium">{campaign?.title}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Judul</div>
            <div className="font-bold text-xl">{update.title}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dibuat Oleh</div>
            <div className="font-medium">{author?.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tanggal</div>
            <div className="font-medium">{new Date(update.created_at).toLocaleString('id-ID')}</div>
          </div>
          {update.disbursement_id && (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ID Pencairan</div>
              <div className="font-medium text-xs font-mono">{update.disbursement_id}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Isi Update</div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{update.body}</p>
            </div>
          </div>
          {update.image_urls && update.image_urls.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gambar</div>
              <div className="flex flex-wrap gap-2">
                {update.image_urls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener" className="text-blue-600 hover:underline text-sm">
                    Gambar {i + 1}
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