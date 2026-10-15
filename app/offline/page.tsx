'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center border border-amber-200 dark:border-amber-900">
          <span className="text-4xl">📡</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">Tidak Ada Koneksi</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sepertinya Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">
            Yang Bisa Dilakukan:
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
            <li>✓ Lihat kampanye yang sudah dibuka sebelumnya</li>
            <li>✓ Baca informasi yang ter-cache</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
            Butuh Koneksi:
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
            <li>✗ Berdonasi (perlu verifikasi online)</li>
            <li>✗ Lihat kampanye terbaru</li>
            <li>✗ Akses portal admin</li>
          </ul>
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="block text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
          >
            ← Kembali ke Beranda
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-4">
          Periksa koneksi internet Anda dan coba muat ulang halaman.
        </p>
      </div>
    </div>
  );
}
