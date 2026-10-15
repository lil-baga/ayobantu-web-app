import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import PublicNavbar from './_components/PublicNavbar';
import PublicFooter from './_components/PublicFooter';
import PWAProvider from './_components/PWAProvider';
import InstallPrompt from './_components/InstallPrompt';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createAdminClient();

  // Fetch featured active campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, slug, title, story, cover_image_url, target_amount, beneficiary_name')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch funds for calculation
  const { data: funds } = await supabase
    .from('campaign_funds')
    .select('campaign_id, collected')
    .in('campaign_id', (campaigns || []).map((c) => c.id));

  const fundsMap = new Map(funds?.map((f) => [f.campaign_id, f.collected]) || []);

  return (
    <PWAProvider>
      <InstallPrompt />
      <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Transparansi Penyaluran Dana Terbuka
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight text-gray-900 dark:text-white">
            Bantu Mereka yang Membutuhkan, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Secara Nyata & Transparan</span>.
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
            AyoBantu menghubungkan kepedulian Anda dengan mereka yang terdampak bencana, sakit, atau membutuhkan biaya pendidikan tanpa potongan tersembunyi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/kampanye"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Mulai Berdonasi
            </Link>
            <Link
              href="/kampanye"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 font-semibold text-gray-800 dark:text-gray-200 transition"
            >
              Lihat Bukti Pencairan
            </Link>
          </div>

          {/* Quick value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12 border-t border-gray-200/60 dark:border-gray-800/60 text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-bold text-sm mb-1">Donasi Tanpa Akun</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Siapapun bisa langsung berbagi tanpa ribet registrasi akun.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="text-2xl mb-2">🔍</div>
              <h4 className="font-bold text-sm mb-1">Lacak Status Realtime</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dapatkan token unik setiap donasi untuk memantau status pembayaran.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="text-2xl mb-2">📑</div>
              <h4 className="font-bold text-sm mb-1">Bukti Nota & Transfer</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Setiap dana yang dicairkan wajib melampirkan nota asli dan foto dokumentasi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Kampanye Pilihan</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">Mendesak Butuh Bantuan</h2>
          </div>
          <Link
            href="/kampanye"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map((c) => {
            const collected = fundsMap.get(c.id) || 0;
            const percentage = Math.min(Math.round((collected / c.target_amount) * 100), 100);

            return (
              <Link
                key={c.id}
                href={`/kampanye/${c.slug}`}
                className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-gray-800 overflow-hidden">
                  {c.cover_image_url ? (
                    <img
                      src={c.cover_image_url}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      AyoBantu Peduli
                    </div>
                  )}
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white">
                    {c.beneficiary_name}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                      {c.story}
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
                        <span className="text-gray-400">Terkumpul </span>
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
      </section>

      <PublicFooter />
      </div>
    </PWAProvider>
  );
}
