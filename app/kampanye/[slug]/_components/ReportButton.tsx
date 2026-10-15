'use client';

import { useState } from 'react';

interface Props {
  campaignId: string;
}

export default function ReportButton({ campaignId }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    reason: '',
    details: '',
    reporter_contact: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId, ...formData }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Terjadi kesalahan');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setFormData({ reason: '', details: '', reporter_contact: '' });
    }, 2000);
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="w-full mt-4 text-sm text-red-600 hover:underline"
      >
        Laporkan Kampanye
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Laporkan Kampanye</h3>
            
            {success ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <p className="font-medium">Laporan berhasil dikirim</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Tim kami akan meninjau laporan Anda
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Alasan *</label>
                  <select
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="">Pilih alasan</option>
                    <option value="Informasi tidak akurat">Informasi tidak akurat</option>
                    <option value="Penipuan">Penipuan</option>
                    <option value="Kampanye duplikat">Kampanye duplikat</option>
                    <option value="Konten tidak pantas">Konten tidak pantas</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Detail (opsional)</label>
                  <textarea
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    placeholder="Jelaskan lebih detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Kontak (opsional)</label>
                  <input
                    type="text"
                    value={formData.reporter_contact}
                    onChange={(e) => setFormData({ ...formData, reporter_contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    placeholder="Email atau nomor telepon"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-md text-sm transition"
                  >
                    {loading ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
