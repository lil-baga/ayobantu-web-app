'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  donationId: string;
  maxAmount: number;
}

export default function RefundButton({ donationId, maxAmount }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRefund() {
    const amountStr = prompt(`Masukkan nominal refund (Maksimal Rp${maxAmount.toLocaleString('id-ID')}):`, String(maxAmount));
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0 || amount > maxAmount) {
      alert('Nominal tidak valid!');
      return;
    }

    const note = prompt('Masukkan alasan refund:', 'Permintaan donatur') || '';

    if (!confirm(`Konfirmasi refund Rp${amount.toLocaleString('id-ID')}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/donations/${donationId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refund_amount: amount, refund_note: note }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal memproses refund');
        return;
      }

      router.refresh();
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRefund}
      disabled={loading}
      className="px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium rounded transition disabled:opacity-50"
    >
      {loading ? '...' : 'Refund'}
    </button>
  );
}
