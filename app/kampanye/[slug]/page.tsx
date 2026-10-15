import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ReportButton from './_components/ReportButton';
import DonateButton from './_components/DonateButton';
import PublicNavbar from '../../_components/PublicNavbar';
import PublicFooter from '../../_components/PublicFooter';

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
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/kampanye" className="hover:text-blue-600 transition">
            Kampanye
          </Link>
          <span>/</span>
          <span className="truncate max-w-xs text-gray-900 dark:text-gray-200 font-medium">
            {campaign.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative">
                {campaign.cover_image_url ? (
                  <img
                    src={campaign.cover_image_url}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    AyoBantu Peduli
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm">
                    Penerima: {campaign.beneficiary_name}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-snug">
                  {campaign.title}
                </h1>

                <div className="prose dark:prose-invert max-w-none pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-bold mb-3">Cerita Penggalangan Dana</h3>
                  <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                    {campaign.story}
                  </p>
                </div>
              </div>
            </div>

            {/* Updates Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Kabar Terbaru</h3>
                  <p className="text-xs text-gray-500">Transparansi perkembangan dan penyaluran donasi</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  {updates?.length || 0} Update
                </span>
              </div>

              {updates && updates.length > 0 ? (
                <div className="space-y-6">
                  {updates.map((update) => (
                    <div
                      key={update.id}
                      className="border-l-2 border-blue-500 pl-4 py-1 space-y-2 relative"
                    >
                      <div className="text-xs text-gray-400">
                        {new Date(update.posted_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base">{update.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {update.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-xs sm:text-sm">
                  Belum ada kabar terbaru dari penggalang dana.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Action & Transparansi */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm sticky top-20 space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                  Dana Terkumpul
                </div>
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  Rp{collected.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  dari target <span className="font-semibold text-gray-700 dark:text-gray-300">Rp{target.toLocaleString('id-ID')}</span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs mt-2 font-medium">
                  <span className="text-blue-600 font-bold">{percentage}% Tercapai</span>
                  <span className="text-gray-400">Terbuka</span>
                </div>
              </div>

              {/* Donation Trigger */}
              <DonateButton campaignId={campaign.id} campaignTitle={campaign.title} />

              {/* Transparency Breakdown */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                  <span>Laporan Transparansi</span>
                  <span className="text-emerald-500">Live</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Total Donasi Masuk</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Rp{collected.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Biaya Operasional (5%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Rp{operational.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Sudah Dicairkan</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Rp{disbursed.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-sm font-bold">
                    <span>Sisa Dana Siap Salur</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Rp{remaining.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {unreported > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
                    ⚠️ Ada <span className="font-bold">Rp{unreported.toLocaleString('id-ID')}</span> dana yang baru dicairkan dan sedang menunggu unggah nota laporan.
                  </div>
                )}
              </div>

              {/* Report Action */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <ReportButton campaignId={campaign.id} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
