import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { decrypt, maskEmail, maskPhone } from '@/lib/crypto';
import Link from 'next/link';
import ConfirmButton from './_components/ConfirmButton';
import RefundButton from './_components/RefundButton';

export const dynamic = 'force-dynamic';

export default async function AdminDonationsPage() {
  const staff = await requireStaff();

  const supabase = createAdminClient();
  const { data: donations } = await supabase
    .from('donations')
    .select(`
      id, amount, status, display_name, is_anonymous, created_at, paid_at,
      campaigns (title, slug),
      donor_contacts (email_enc, phone_enc),
      payments (method, gateway_order_id)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">AyoBantu Admin</h1>
            <div className="flex gap-4 text-sm">
              <Link href="/admin/campaigns" className="text-gray-600 dark:text-gray-400">Kampanye</Link>
              <Link href="/admin/donations" className="font-medium text-blue-600">Donasi</Link>
              <Link href="/admin/disbursements" className="text-gray-600 dark:text-gray-400">Pencairan</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              MODE LOKAL
            </span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {staff.name} ({staff.role})
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Daftar Donasi</h2>
          <a 
            href="/api/admin/donations.csv"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition"
          >
            📥 Export CSV
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Kampanye</th>
                <th className="px-4 py-3 font-medium">Donatur</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Metode</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {donations?.map((d) => {
                const campaign = (d.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;
                const contact = d.donor_contacts as { email_enc?: string; phone_enc?: string } | null;
                const payment = (d.payments as Array<{ method: string; gateway_order_id: string }> | null)?.[0] || null;
                
                let contactDisplay = '';
                try {
                  if (contact?.email_enc) {
                    contactDisplay = maskEmail(decrypt(contact.email_enc));
                  } else if (contact?.phone_enc) {
                    contactDisplay = maskPhone(decrypt(contact.phone_enc));
                  }
                } catch {
                  contactDisplay = '***';
                }

                return (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-4 py-3">{campaign?.title}</td>
                    <td className="px-4 py-3">
                      <div>{d.is_anonymous ? 'Anonim' : d.display_name || 'Hamba Allah'}</div>
                      <div className="text-xs text-gray-500">{contactDisplay}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">Rp{(d.amount / 1000).toLocaleString()}k</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{payment?.method === 'transfer' ? 'Transfer' : 'QRIS'}</div>
                      <div className="text-gray-500">{payment?.gateway_order_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        d.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        d.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(d.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      {d.status === 'pending' && (staff.role === 'finance' || staff.role === 'admin') && (
                        <ConfirmButton donationId={d.id} />
                      )}
                      {d.status === 'paid' && (staff.role === 'finance' || staff.role === 'admin') && (
                        <RefundButton donationId={d.id} maxAmount={d.amount} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
