import Link from 'next/link';
import PublicNavbar from '../../_components/PublicNavbar';
import PublicFooter from '../../_components/PublicFooter';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ token?: string; amount?: string }>;
}

export default async function DonationSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const { token, amount } = params;

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
            <p className="text-red-600 font-semibold mb-4">Token donasi tidak valid atau sudah kedaluwarsa.</p>
            <Link
              href="/kampanye"
              className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition"
            >
              Kembali ke Kampanye
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const trackingUrl = `/lacak/${token}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <PublicNavbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xl p-8 sm:p-10 text-center w-full space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
            ✓
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Terima Kasih, Orang Baik!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Donasi sebesar{' '}
              <span className="font-bold text-gray-900 dark:text-white text-base">
                Rp{parseInt(amount || '0').toLocaleString('id-ID')}
              </span>{' '}
              berhasil dicatat ke dalam antrean sistem.
            </p>
          </div>

          {/* Tracking token card */}
          <div className="bg-slate-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl text-left space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
              <span>Token Unik Lacak Donasi</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">Simpan Link</span>
            </div>

            <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-xs break-all select-all text-gray-800 dark:text-gray-200">
              {trackingUrl}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={trackingUrl}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs text-center shadow-md shadow-blue-500/20 transition"
              >
                🔍 Lacak Status Donasi Saya
              </Link>
            </div>
          </div>

          {/* Mode Lokal Guide */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-left text-xs space-y-2">
            <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <span>ℹ️</span> Simulasi Konfirmasi (Khusus Staf Penguji):
            </div>
            <ol className="text-amber-800/90 dark:text-amber-300/90 space-y-1 list-decimal list-inside text-[11px] leading-relaxed">
              <li>Masuk ke akun Finance di portal <Link href="/admin/login" className="underline font-bold">/admin/login</Link></li>
              <li>Buka halaman menu <strong>Donasi</strong></li>
              <li>Klik tombol <strong>&quot;Konfirmasi Pembayaran&quot;</strong> pada donasi ini</li>
              <li>Status otomatis berubah menjadi <strong>Paid</strong> dan kalkulasi dana kampanye bertambah</li>
            </ol>
          </div>

          <div>
            <Link
              href="/kampanye"
              className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              ← Jelajahi Kampanye Lainnya
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
