'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  donationId: string;
}

export default function ConfirmButton({ donationId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!confirm('Konfirmasi pembayaran untuk donasi ini?')) return;

    setLoading(true);
    const res = await fetch(`/api/admin/donations/${donationId}/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert('Gagal konfirmasi pembayaran');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded transition"
    >
      {loading ? '...' : 'Konfirmasi'}
    </button>
  );
}
