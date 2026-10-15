'use client';

import { useState } from 'react';

interface Props {
  reportId: string;
  status: 'pending' | 'reviewed' | 'closed';
}

export default function ReportActions({ reportId, status }: Props) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (newStatus: 'reviewed' | 'closed') => {
    if (loading) return;
    if (status === newStatus) return;

    setLoading(true);
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId, status: newStatus }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert('Gagal memperbarui status laporan');
    }
    setLoading(false);
  };

  return (
    <div className="flex space-x-2">
      {status === 'pending' && (
        <button
          onClick={() => handleAction('reviewed')}
          disabled={loading}
          className={`px-3 py-1 text-sm rounded ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition`}
        >
          {loading ? 'Sedang...' : 'Review'}
        </button>
      )}
      {(status === 'pending' || status === 'reviewed') && (
        <button
          onClick={() => handleAction('closed')}
          disabled={loading}
          className={`px-3 py-1 text-sm rounded ${
            loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          } text-white transition`}
        >
          {loading ? 'Sedang...' : 'Selesai'}
        </button>
      )}
      {status === 'closed' && (
        <button
          onClick={() => handleAction('reviewed')}
          disabled={loading}
          className={`px-3 py-1 text-sm rounded ${
            loading ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700'
          } text-white transition`}
        >
          {loading ? 'Sedang...' : 'Kembalikan'}
        </button>
      )}
    </div>
  );
}
