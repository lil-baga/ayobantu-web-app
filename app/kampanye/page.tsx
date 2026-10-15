import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import type { Metadata } from 'next';
import PublicNavbar from '../_components/PublicNavbar';
import PublicFooter from '../_components/PublicFooter';

export const metadata: Metadata = {
  title: 'Semua Kampanye - AyoBantu',
  description: 'Daftar kampanye donasi transparan yang sedang berjalan untuk kemanusiaan, medis, dan pendidikan.',
};

export const dynamic = 'force-dynamic';

export default async function KampanyePage() {
  const supabase = createAdminClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, slug, title, story, cover_image_url, target_amount, beneficiary_name')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get funds for each campaign
  const { data: funds } = await supabase
    .from('campaign_funds')
    .select('campaign_id, collected, target_amount')
    .in('campaign_id', (campaigns || []).map((c) => c.id));

  const fundsMap = new Map(funds?.map((f) => [f.campaign_id, f.collected]) || []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-8">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Program Donasi
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Daftar Kampanye Aktif</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pilih dan salurkan bantuan langsung kepada mereka yang membutuhkan secara aman dan transparan.
          </p>
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const collected = fundsMap.get(campaign.id) || 0;
              const target = campaign.target_amount;
              const percentage = Math.min(Math.round((collected / target) * 100), 100);

              return (
                <Link
                  key={campaign.id}
                  href={`/kampanye/${campaign.slug}`}
                  className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {campaign.cover_image_url ? (
                      <img
                        src={campaign.cover_image_url}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        AyoBantu Peduli
                      </div>
                    )}
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white">
                      {campaign.beneficiary_name}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {campaign.title}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                        {campaign.story}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-2.5">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-baseline text-xs">
                        <div>
                          <span className="text-gray-400 text-[11px]">Terkumpul </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            Rp{collected.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500">Belum ada kampanye aktif saat ini.</p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
