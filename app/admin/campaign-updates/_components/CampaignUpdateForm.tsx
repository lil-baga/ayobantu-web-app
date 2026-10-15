'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  title: string;
}

interface Props {
  campaigns: Campaign[];
}

export default function CampaignUpdateForm({ campaigns }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    campaign_id: '',
    title: '',
    body: '',
    image_urls: '' as string, // comma-separated
    disbursement_id: '' as string,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      image_urls: formData.image_urls.split(',').map((s) => s.trim()).filter(Boolean),
      disbursement_id: formData.disbursement_id || null,
    };

    const res = await fetch('/api/admin/campaign-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Gagal membuat update');
      setLoading(false);
      return;
    }

    router.push('/admin/campaign-updates');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Judul *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Isi *</label>
        <textarea
          required
          rows={5}
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">URL Gambar (pisah koma)</label>
        <input
          type="text"
          placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
          value={formData.image_urls}
          onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">ID Pencairan (opsional)</label>
        <input
          type="text"
          value={formData.disbursement_id}
          onChange={(e) => setFormData({ ...formData, disbursement_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition"
      >
        {loading ? 'Menyimpan...' : 'Buat Update'}
      </button>
    </form>
  );
}
