import Link from 'next/link';

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AyoBantu
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/kampanye"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Jelajahi Kampanye
          </Link>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
          <Link
            href="/admin/login"
            className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
          >
            Portal Staf
          </Link>
        </nav>
      </div>
    </header>
  );
}
