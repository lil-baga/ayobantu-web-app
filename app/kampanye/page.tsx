import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kampanye - AyoBantu',
  description: 'Daftar kampanye donasi yang sedang berjalan',
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
    .in('campaign_id', (campaigns || []).map(c => c.id));

  const fundsMap = new Map(funds?.map(f => [f.campaign_id, f]) || []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">AyoBantu</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kampanye Donasi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map((campaign) => {
            const fund = fundsMap.get(campaign.id);
            const collected = fund?.collected || 0;
            const target = campaign.target_amount;
            const percentage = Math.min(Math.round((collected / target) * 100), 100);

            return (
              <Link 
                key={campaign.id}
                href={`/kampanye/${campaign.slug}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {campaign.cover_image_url ? (
                  <img 
                    src={campaign.cover_image_url} 
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h2 className="font-bold text-lg mb-2 line-clamp-2">{campaign.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {campaign.beneficiary_name}
                  </p>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Terkumpul</span>
                      <span className="font-bold text-blue-600">
                        Rp{(collected / 1000).toLocaleString('id-ID')}rb
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Target: Rp{(target / 1000).toLocaleString('id-ID')}rb ({percentage}%)
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!campaigns || campaigns.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            Belum ada kampanye aktif
          </div>
        )}
      </main>
    </div>
  );
}
