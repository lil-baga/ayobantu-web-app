import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { decrypt, maskEmail, maskPhone } from '@/lib/crypto';
import Link from 'next/link';
import crypto from 'crypto';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">AyoBantu</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Detail Donasi</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {/* Status Badge */}
          <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className={`inline-block px-4 py-2 rounded-full font-medium ${
              donation.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
              donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
              donation.status === 'refunded' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}>
              {donation.status === 'paid' ? '✓ Dibayar' :
               donation.status === 'pending' ? '⏱ Pending' :
               donation.status === 'refunded' ? '↩ Refund' :
               donation.status === 'failed' ? '✗ Gagal' : '⏰ Expired'}
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Jumlah Donasi</div>
            <div className="text-3xl font-bold text-blue-600">
              Rp{donation.amount.toLocaleString('id-ID')}
            </div>
            {donation.status === 'refunded' && donation.refund_amount && (
              <div className="text-sm text-purple-600 mt-1">
                Refund: Rp{donation.refund_amount.toLocaleString('id-ID')}
              </div>
            )}
          </div>

          {/* Campaign */}
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kampanye</div>
            <Link 
              href={`/kampanye/${campaign?.slug}`}
              className="text-lg font-medium text-blue-600 hover:underline"
            >
              {campaign?.title}
            </Link>
          </div>

          {/* Donator Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nama</div>
              <div className="font-medium">
                {donation.is_anonymous ? 'Anonim' : donation.display_name || 'Hamba Allah'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kontak</div>
              <div className="text-sm">
                {email && maskEmail(email)}
                {phone && <div>{maskPhone(phone)}</div>}
              </div>
            </div>
          </div>

          {/* Message */}
          {donation.message && (
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pesan</div>
              <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
                {donation.message}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Metode</span>
              <span className="font-medium">{payment?.method === 'transfer' ? 'Transfer Bank' : 'QRIS'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Order ID</span>
              <span className="font-mono text-xs">{payment?.gateway_order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Dibuat</span>
              <span>{new Date(donation.created_at).toLocaleString('id-ID')}</span>
            </div>
            {donation.paid_at && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Dibayar</span>
                <span>{new Date(donation.paid_at).toLocaleString('id-ID')}</span>
              </div>
            )}
            {donation.status === 'pending' && payment?.expires_at && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Kadaluarsa</span>
                <span>{new Date(payment.expires_at).toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          {donation.refund_note && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Catatan Refund</div>
              <div className="text-sm">{donation.refund_note}</div>
            </div>
          )}

          {donation.status === 'pending' && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <div className="font-medium mb-2">Menunggu Konfirmasi</div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  Donasi Anda menunggu konfirmasi dari tim Finance. Ini adalah mode lokal (tidak ada pembayaran sungguhan).
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/kampanye" className="text-blue-600 hover:underline">
            Lihat Kampanye Lainnya
          </Link>
        </div>
      </main>
    </div>
  );
}
