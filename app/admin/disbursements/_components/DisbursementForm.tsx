'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Campaign {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  campaigns: Campaign[];
}

export default function DisbursementForm({ campaigns }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    campaign_id: '',
    amount: 0,
    category: '',
    description: '',
    recipient_name: '',
    disbursed_at: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/disbursements', {
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

    router.push('/admin/disbursements');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Kampanye *</label>
        <select
          required
          value={formData.campaign_id}
          onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="">Pilih kampanye</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Jumlah (Rp) *</label>
          <input
            type="number"
            required
            min="1000"
            step="1000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Kategori *</label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            placeholder="Contoh: Logistik"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Nama Penerima *</label>
        <input
          type="text"
          required
          value={formData.recipient_name}
          onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Deskripsi</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          placeholder="Detail pencairan..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tanggal Pencairan</label>
        <input
          type="datetime-local"
          value={formData.disbursed_at}
          onChange={(e) => setFormData({ ...formData, disbursed_at: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        />
        <div className="text-xs text-gray-500 mt-1">Kosongkan untuk saat ini</div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition"
        >
          {loading ? 'Menyimpan...' : 'Buat Pencairan'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
