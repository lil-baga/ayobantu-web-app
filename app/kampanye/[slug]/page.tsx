import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ReportButton from './_components/ReportButton';
import DonateButton from './_components/DonateButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('title, story, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!campaign) {
    return { title: 'Kampanye Tidak Ditemukan' };
  }

  return {
    title: `${campaign.title} - AyoBantu`,
    description: campaign.story.slice(0, 160),
    openGraph: {
      title: campaign.title,
      description: campaign.story.slice(0, 160),
      images: campaign.cover_image_url ? [campaign.cover_image_url] : [],
      type: 'website',
    },
  };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!campaign) notFound();

  const { data: funds } = await supabase
    .from('campaign_funds')
    .select('collected, operational, disbursed, remaining, unreported')
    .eq('campaign_id', campaign.id)
    .single();

  const { data: updates } = await supabase
    .from('campaign_updates')
    .select('id, title, body, image_urls, posted_at')
    .eq('campaign_id', campaign.id)
    .order('posted_at', { ascending: false })
    .limit(10);

  const collected = funds?.collected || 0;
  const target = campaign.target_amount;
  const percentage = Math.min(Math.round((collected / target) * 100), 100);
  const operational = funds?.operational || 0;
  const disbursed = funds?.disbursed || 0;
  const remaining = funds?.remaining || 0;
  const unreported = funds?.unreported || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/kampanye" className="text-blue-600 hover:underline">← Kembali</Link>
          <Link href="/" className="text-2xl font-bold text-blue-600">AyoBantu</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {campaign.cover_image_url && (
              <img 
                src={campaign.cover_image_url}
                alt={campaign.title}
                className="w-full rounded-lg shadow-lg"
              />
            )}

            <div>
              <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Untuk: {campaign.beneficiary_name}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Cerita Kampanye</h2>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {campaign.story}
              </p>
            </div>

            {/* Updates */}
            {updates && updates.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Update Kampanye</h2>
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(update.posted_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </div>
                      <h3 className="font-bold mb-2">{update.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{update.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Terkumpul</div>
                <div className="text-2xl font-bold text-blue-600">
                  Rp{collected.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {percentage}% dari target Rp{target.toLocaleString('id-ID')}
                </div>
              </div>

              <DonateButton campaignId={campaign.id} campaignTitle={campaign.title} />

              {/* Transparency */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Terkumpul</span>
                  <span className="font-medium">Rp{collected.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Biaya Operasional</span>
                  <span className="font-medium">Rp{operational.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dicairkan</span>
                  <span className="font-medium">Rp{disbursed.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Sisa Dana</span>
                  <span className="font-bold text-green-600">Rp{remaining.toLocaleString('id-ID')}</span>
                </div>
                {unreported > 0 && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-500">
                    ⚠ Rp{unreported.toLocaleString('id-ID')} belum dilaporkan
                  </div>
                )}
              </div>

              <ReportButton campaignId={campaign.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
