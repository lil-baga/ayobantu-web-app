'use client';

import { useState } from 'react';

interface Props {
  disbursementId: string;
}

export default function ProofUpload({ disbursementId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<'nota' | 'transfer' | 'foto'>('nota');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    try {
      const res = await fetch(`/api/admin/disbursements/${disbursementId}/proof/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal mengupload bukti');
        setLoading(false);
        return;
      }

      setFile(null);
      window.location.reload();
    } catch (err) {
      setError('Gagal mengupload bukti');
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="font-bold mb-3">Unggah Bukti</h3>
      <form onSubmit={handleUpload} className="space-y-3">
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as 'nota' | 'transfer' | 'foto')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
        >
          <option value="nota">Nota</option>
          <option value="transfer">Transfer</option>
          <option value="foto">Foto</option>
        </select>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition"
        >
          {loading ? 'Mengupload...' : 'Unggah'}
        </button>
      </form>
    </div>
  );
}
