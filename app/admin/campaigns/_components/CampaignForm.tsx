'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  campaign?: {
    id: string;
    title: string;
    slug: string;
    story: string;
    cover_image_url: string | null;
    target_amount: number;
    status: string;
    operational_fee_bps: number;
    beneficiary_name: string;
    starts_at: string | null;
    ends_at: string | null;
  };
}

export default function CampaignForm({ campaign }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    slug: campaign?.slug || '',
    story: campaign?.story || '',
    cover_image_url: campaign?.cover_image_url || '',
    target_amount: campaign?.target_amount || 1000000,
    status: campaign?.status || 'draft',
    operational_fee_bps: campaign?.operational_fee_bps || 500,
    beneficiary_name: campaign?.beneficiary_name || '',
    starts_at: campaign?.starts_at ? campaign.starts_at.slice(0, 16) : '',
    ends_at: campaign?.ends_at ? campaign.ends_at.slice(0, 16) : '',
  });

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = campaign 
      ? `/api/admin/campaigns/${campaign.id}`
      : '/api/admin/campaigns';
    
    const method = campaign ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Terjadi kesalahan');
      setLoading(false);
      return;
    }

    router.push('/admin/campaigns');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Judul Kampanye *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                title: e.target.value,
                slug: !campaign ? generateSlug(e.target.value) : formData.slug,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Slug (URL) *</label>
          <input
            type="text"
            required
            pattern="[a-z0-9-]+"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 font-mono text-sm"
          />
          <div className="text-xs text-gray-500 mt-1">
            Hanya huruf kecil, angka, dan strip. Contoh: bantu-korban-banjir
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Cerita *</label>
          <textarea
            required
            rows={8}
            value={formData.story}
            onChange={(e) => setFormData({ ...formData, story: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Nama Penerima Manfaat *</label>
          <input
            type="text"
            required
            value={formData.beneficiary_name}
            onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Dana (Rp) *</label>
          <input
            type="number"
            required
            min="100000"
            step="10000"
            value={formData.target_amount}
            onChange={(e) => setFormData({ ...formData, target_amount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Biaya Operasional (bps) *</label>
          <input
            type="number"
            required
            min="0"
            max="1000"
            value={formData.operational_fee_bps}
            onChange={(e) => setFormData({ ...formData, operational_fee_bps: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
          <div className="text-xs text-gray-500 mt-1">
            500 bps = 5%. Max 1000 bps (10%)
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status *</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Cover Image URL</label>
          <input
            type="url"
            value={formData.cover_image_url}
            onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mulai (opsional)</label>
          <input
            type="datetime-local"
            value={formData.starts_at}
            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Selesai (opsional)</label>
          <input
            type="datetime-local"
            value={formData.ends_at}
            onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition"
        >
          {loading ? 'Menyimpan...' : campaign ? 'Update' : 'Buat Kampanye'}
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
