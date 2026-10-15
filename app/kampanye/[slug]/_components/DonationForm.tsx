'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DonationInput } from '@/lib/validations/donation';

interface Props {
  campaignId: string;
  campaignTitle: string;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000, 500000];

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
    notify_updates: true,
    method: 'qris',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-check email or phone
    if (!formData.email?.trim() && !formData.phone?.trim()) {
      setError('Mohon isi minimal salah satu: Alamat Email atau Nomor Telepon.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat membuat donasi.');
        setLoading(false);
        return;
      }

      // Redirect to success page with token
      router.push(`/donasi/sukses?token=${data.tracking_token}&amount=${data.amount}`);
    } catch {
      setError('Gagal menghubungi server. Periksa koneksi internet Anda.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 p-3.5 rounded-xl">
        <div className="text-xs text-blue-900 dark:text-blue-300">
          Target Kampanye: <span className="font-bold">{campaignTitle}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Preset Amounts */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Pilih Nominal Donasi
        </label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setFormData({ ...formData, amount: val })}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                formData.amount === val
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:border-blue-500 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Rp{val.toLocaleString('id-ID')}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
            Rp
          </span>
          <input
            type="number"
            required
            min="10000"
            step="1000"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Nominal lainnya"
          />
        </div>
        <span className="text-[11px] text-gray-400 mt-1 block">Minimal donasi Rp10.000</span>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="nama@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            WhatsApp / Telepon
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="081234567890"
          />
        </div>
      </div>
      <p className="text-[11px] text-blue-600 dark:text-blue-400">
        * Isi minimal salah satu untuk pengiriman tanda terima token lacak donasi.
      </p>

      {/* Name and Anonymous */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Nama Donatur (Opsional)
        </label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Hamba Allah / Nama Anda"
        />
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_anonymous}
            onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Sembunyikan nama saya dari publik (Anonim)
          </span>
        </label>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Doa & Dukungan (Opsional)
        </label>
        <textarea
          rows={2}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Semoga lekas pulih dan berkah..."
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Pilihan Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
              formData.method === 'qris'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
            }`}
          >
            <input
              type="radio"
              value="qris"
              checked={formData.method === 'qris'}
              onChange={() => setFormData({ ...formData, method: 'qris' })}
              className="text-blue-600"
            />
            <div>
              <div className="text-xs font-bold">QRIS Instant</div>
              <div className="text-[10px] text-gray-400">Gopay, OVO, ShopeePay, BCA</div>
            </div>
          </label>

          <label
            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
              formData.method === 'transfer'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
            }`}
          >
            <input
              type="radio"
              value="transfer"
              checked={formData.method === 'transfer'}
              onChange={() => setFormData({ ...formData, method: 'transfer' })}
              className="text-blue-600"
            />
            <div>
              <div className="text-xs font-bold">Transfer Bank</div>
              <div className="text-[10px] text-gray-400">BCA, Mandiri, BNI, BRI</div>
            </div>
          </label>
        </div>
      </div>

      {/* Mode Lokal Notice */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] flex gap-2 items-start">
        <span>ℹ️</span>
        <span>
          <strong>Simulasi Mode Lokal:</strong> Tidak ada penarikan saldo sungguhan. Donasi akan berstatus <em>pending</em> hingga dikonfirmasi oleh staf Finance.
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          'Lanjutkan Donasi'
        )}
      </button>
    </form>
  );
}
