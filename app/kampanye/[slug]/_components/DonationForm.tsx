'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DonationInput } from '@/lib/validations/donation';

interface Props {
  campaignId: string;
  campaignTitle: string;
}

export default function DonationForm({ campaignId, campaignTitle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<DonationInput>>({
    campaign_id: campaignId,
    amount: 50000,
    display_name: '',
    is_anonymous: false,
    message: '',
    email: '',
    phone: '',
    notify_updates: false,
    method: 'transfer',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.fieldErrors ? JSON.stringify(data.error.fieldErrors) : data.error || 'Terjadi kesalahan');
      setLoading(false);
      return;
    }

    const data = await res.json();
    // Redirect to success page with token
    router.push(`/donasi/sukses?token=${data.tracking_token}&amount=${data.amount}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          Anda akan berdonasi untuk: <span className="font-bold">{campaignTitle}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Jumlah Donasi (Rp) *</label>
        <input
          type="number"
          required
          min="10000"
          step="1000"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-lg font-bold"
        />
        <div className="text-xs text-gray-500 mt-1">Minimal Rp10.000</div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, amount: 50000 })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm"
        >
          Rp50.000
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, amount: 100000 })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm"
        >
          Rp100.000
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, amount: 500000 })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm"
        >
          Rp500.000
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Nama Tampilan (opsional)</label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          placeholder="Nama Anda"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={formData.is_anonymous}
          onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="anonymous" className="text-sm">Donasi sebagai Anonim</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Pesan (opsional)</label>
        <textarea
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          placeholder="Tulis pesan dukungan..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          placeholder="email@contoh.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Nomor Telepon *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          placeholder="08123456789"
        />
        <div className="text-xs text-gray-500 mt-1">Isi salah satu: email atau nomor telepon</div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="notify"
          checked={formData.notify_updates}
          onChange={(e) => setFormData({ ...formData, notify_updates: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="notify" className="text-sm">Kirim saya update kampanye</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Metode Pembayaran *</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="transfer"
              checked={formData.method === 'transfer'}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as 'transfer' | 'qris' })}
            />
            <span className="text-sm">Transfer Bank</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="qris"
              checked={formData.method === 'qris'}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as 'transfer' | 'qris' })}
            />
            <span className="text-sm">QRIS</span>
          </label>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg text-sm">
        <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">MODE LOKAL</div>
        <div className="text-yellow-700 dark:text-yellow-300 text-xs">
          Ini adalah sistem pembayaran lokal untuk proyek kuliah. Tidak ada uang sungguhan yang berpindah.
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
      >
        {loading ? 'Memproses...' : 'Lanjutkan'}
      </button>
    </form>
  );
}
