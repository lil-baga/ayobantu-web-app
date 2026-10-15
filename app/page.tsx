import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">AyoBantu</h1>
          <Link href="/admin/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
            Login Staff
          </Link>
        </div>
      </nav>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-2xl">
          <h2 className="text-5xl font-bold">Platform Donasi Online</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Bantu sesama dengan mudah dan transparan
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/kampanye"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Lihat Kampanye
            </Link>
          </div>
          <div className="mt-8 inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded">
            MODE LOKAL - Proyek Kuliah
          </div>
        </div>
      </div>
    </main>
  );
}
