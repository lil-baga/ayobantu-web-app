'use client';

import { useState } from 'react';

interface Props {
  disbursementId: string;
  currentStatus: 'planned' | 'disbursed' | 'reported';
}

export default function DisbursementStatus({ disbursementId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const statuses: Array<'planned' | 'disbursed' | 'reported'> = ['planned', 'disbursed', 'reported'];
  const statusLabels = {
    planned: 'Rencana',
    disbursed: 'Dicairkan',
    reported: 'Dilaporkan',
  };

  async function handleUpdate(newStatus: typeof statuses[number]) {
    if (newStatus === status) return;
    if (!confirm(`Ubah status ke "${statusLabels[newStatus]}"?`)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/disbursements/${disbursementId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setStatus(newStatus);
    } else {
      alert('Gagal mengubah status');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {statuses.map((s, i) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => handleUpdate(s)}
              disabled={loading || status === s}
              className={`px-3 py-2 rounded-md text-xs font-medium transition ${
                status === s 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {statusLabels[s]}
            </button>
            {i < statuses.length - 1 && (
              <div className="w-4 h-0.5 bg-gray-300 dark:bg-gray-600 mx-1" />
            )}
          </div>
        ))}
      </div>

      {status === 'reported' && (
        <div className="text-xs text-green-600 dark:text-green-400">
          ✓ Dilaporkan - pastikan bukti sudah diupload
        </div>
      )}
      {status === 'disbursed' && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400">
          ⚠ Dicairkan - unggah bukti untuk merubah ke &quot;Dilaporkan&quot;
        </div>
      )}
    </div>
  );
}