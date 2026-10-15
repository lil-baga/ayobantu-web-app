import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { decrypt, maskEmail, maskPhone } from '@/lib/crypto';
import Link from 'next/link';
import crypto from 'crypto';
import PublicNavbar from '../../_components/PublicNavbar';
import PublicFooter from '../../_components/PublicFooter';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function TrackDonationPage({ params }: Props) {
  const { token } = await params;

  // Hash token to lookup
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const supabase = createAdminClient();

  const { data: donation } = await supabase
    .from('donations')
    .select(`
      id, amount, status, display_name, is_anonymous, message, 
      created_at, paid_at, refund_amount, refund_note,
      campaign_id,
      campaigns (title, slug),
      donor_contacts (email_enc, phone_enc)
    `)
    .eq('tracking_token_hash', tokenHash)
    .single();

  if (!donation) notFound();

  const { data: payment } = await supabase
    .from('payments')
    .select('method, gateway_order_id, status, expires_at, paid_at')
    .eq('donation_id', donation.id)
    .single();

  // Decrypt contact (mask for display)
  const contact = donation.donor_contacts as { email_enc?: string; phone_enc?: string } | null;
  const email = contact?.email_enc ? decrypt(contact.email_enc) : null;
  const phone = contact?.phone_enc ? decrypt(contact.phone_enc) : null;

  const campaign = (donation.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <PublicNavbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/kampanye" className="hover:text-blue-600 transition">
            Kampanye
          </Link>
          <span>/</span>
          <span className="truncate max-w-xs text-gray-900 dark:text-gray-200 font-medium">
            Lacak Donasi
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xl overflow-hidden">
          {/* Header Status Banner */}
          <div className="p-8 text-center border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/20">
            <div className="inline-block mb-3">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm ${
                  donation.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : donation.status === 'pending'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : donation.status === 'refunded'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {donation.status === 'paid' && '✓ Pembayaran Berhasil'}
                {donation.status === 'pending' && '⏱ Menunggu Verifikasi Pembayaran'}
                {donation.status === 'refunded' && '↩ Dana Telah Di-refund'}
                {donation.status === 'failed' && '✕ Pembayaran Dibatalkan'}
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Rp{donation.amount.toLocaleString('id-ID')}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Ditujukan untuk:{' '}
              <Link
                href={`/kampanye/${campaign?.slug}`}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {campaign?.title}
              </Link>
            </p>
          </div>

          {/* Details Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  Nama Donatur
                </div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  {donation.is_anonymous ? 'Anonim (Dirahasiakan)' : donation.display_name || 'Hamba Allah'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  Kontak Tersamar
                </div>
                <div className="font-bold text-sm text-gray-900 dark:text-white font-mono">
                  {email ? maskEmail(email) : phone ? maskPhone(phone) : '-'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  Metode Pembayaran
                </div>
                <div className="font-bold text-sm text-gray-900 dark:text-white uppercase font-mono">
                  {payment?.method || 'LOCAL'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                  Waktu Transaksi
                </div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  {new Date(donation.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Message */}
            {donation.message && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
                  Pesan & Doa Donatur
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic">
                  &ldquo;{donation.message}&rdquo;
                </p>
              </div>
            )}

            {/* Refund Info if any */}
            {donation.status === 'refunded' && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300">
                <div className="font-bold mb-1">Catatan Pengembalian Dana (Refund):</div>
                <p>{donation.refund_note || 'Refund diproses oleh bagian keuangan.'}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
