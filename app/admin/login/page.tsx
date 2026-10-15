'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  function handleQuickFill(role: 'admin' | 'finance') {
    if (role === 'admin') {
      setEmail('admin@ayobantu.local');
      setPassword('password123');
    } else {
      setEmail('finance@ayobantu.local');
      setPassword('password123');
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-8 sm:p-10 rounded-3xl shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Portal Staf AyoBantu</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Masuk untuk mengelola kampanye, donasi, dan pencairan dana.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs p-3.5 rounded-xl">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="admin@ayobantu.local"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Portal'}
          </button>
        </form>

        {/* Quick Fill Helper for local test */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">
            Akun Demo Penguji:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Akun Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('finance')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Akun Finance
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
            ← Kembali ke Beranda Donasi
          </Link>
        </div>
      </div>
    </div>
  );
}
