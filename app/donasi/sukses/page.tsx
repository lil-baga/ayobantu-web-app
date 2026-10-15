import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ token?: string; amount?: string }>;
}

export default async function DonationSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const { token, amount } = params;

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">Token tidak ditemukan</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const trackingUrl = `/lacak/${token}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">AyoBantu</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-4">Terima Kasih!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Donasi Anda sebesar <span className="font-bold text-blue-600">Rp{parseInt(amount || '0').toLocaleString('id-ID')}</span> berhasil dibuat
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Status: <span className="font-medium text-yellow-600">Pending (menunggu konfirmasi)</span>
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg mb-8">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              Link Lacak Donasi (simpan link ini!)
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border border-blue-300 dark:border-blue-700 mb-4">
              <code className="text-sm break-all">{typeof window !== 'undefined' ? window.location.origin : ''}{trackingUrl}</code>
            </div>
            <Link 
              href={trackingUrl}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Lacak Donasi
            </Link>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg text-sm text-left space-y-2">
            <div className="font-medium text-yellow-800 dark:text-yellow-200">MODE LOKAL - Cara Konfirmasi:</div>
            <ol className="text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside text-xs">
              <li>Login sebagai Finance di <Link href="/admin/login" className="underline">/admin/login</Link></li>
              <li>Buka menu Donasi</li>
              <li>Cari donasi Anda dan klik &quot;Konfirmasi Pembayaran&quot;</li>
              <li>Status akan berubah menjadi &quot;Paid&quot; dan dana akan dihitung</li>
            </ol>
          </div>

          <Link 
            href="/"
            className="inline-block mt-8 text-blue-600 hover:underline"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
