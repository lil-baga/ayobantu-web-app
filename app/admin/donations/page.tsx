import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { decrypt, maskEmail, maskPhone } from '@/lib/crypto';
import ConfirmButton from './_components/ConfirmButton';
import RefundButton from './_components/RefundButton';
import AdminNav from '../_components/AdminNav';

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="donations" staff={{ name: staff.name, role: staff.role }} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Daftar Donasi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verifikasi dan kelola transaksi donasi</p>
          </div>
          <a 
            href="/api/admin/donations.csv"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition text-sm flex items-center gap-2"
          >
            📥 Export CSV
          </a>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-3.5">Kampanye</th>
                  <th className="px-5 py-3.5">Donatur</th>
                  <th className="px-5 py-3.5">Jumlah</th>
                  <th className="px-5 py-3.5">Metode</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">{campaign?.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-sm">{d.is_anonymous ? 'Anonim' : d.display_name || 'Hamba Allah'}</div>
                        <div className="text-xs text-gray-500 mt-0.5 font-mono">{contactDisplay}</div>
                      </td>
                      <td className="px-5 py-4 font-bold">Rp{(d.amount / 1000).toLocaleString()}k</td>
                      <td className="px-5 py-4 text-xs">
                        <div className="font-semibold">{payment?.method === 'transfer' ? 'Transfer' : 'QRIS'}</div>
                        <div className="text-gray-500 font-mono text-[10px] truncate max-w-[100px]">{payment?.gateway_order_id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-block border ${
                          d.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                          d.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                          'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {d.status === 'pending' && (
                            <ConfirmButton donationId={d.id} />
                          )}
                          {d.status === 'paid' && (
                            <RefundButton donationId={d.id} maxAmount={d.amount} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!donations || donations.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                      Belum ada donasi masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
