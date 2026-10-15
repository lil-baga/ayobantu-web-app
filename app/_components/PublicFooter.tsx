import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </span>
            <span className="font-bold text-gray-900 dark:text-gray-100">AyoBantu</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            Platform donasi transparan berbasis web untuk kemanusiaan, sosial, dan pendidikan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
          <Link href="/kampanye" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
            Semua Kampanye
          </Link>
          <Link href="/admin/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
            Login Staf
          </Link>
          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-[10px] font-mono">
            PAYMENT_MODE=local
          </span>
        </div>
      </div>
    </footer>
  );
}
