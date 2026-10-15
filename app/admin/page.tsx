import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import AdminNav from './_components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const staff = await requireStaff();

  const supabase = createAdminClient();

  // Fetch stats in parallel
  const [
    { count: activeCampaigns },
    { count: totalDonations },
    { count: pendingDonations },
    { count: totalDisbursements },
    { count: reportedDisbursements },
    { data: recentDonations },
    { data: recentDisbursements },
  ] = await Promise.all([
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('donations').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('disbursements').select('*', { count: 'exact', head: true }),
    supabase.from('disbursements').select('*', { count: 'exact', head: true }).eq('status', 'reported'),
    supabase
      .from('donations')
      .select('id, amount, status, display_name, created_at, paid_at, campaigns(title)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('disbursements')
      .select('id, amount, status, recipient_name, created_at, campaigns(title)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Total collected amount
  const { data: paidDonationsAmount } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'paid');

  const totalCollected = paidDonationsAmount?.reduce((sum, d) => sum + d.amount, 0) || 0;

  // Total disbursed amount
  const { data: disbursedAmount } = await supabase
    .from('disbursements')
    .select('amount')
    .eq('status', 'reported');

  const totalDisbursed = disbursedAmount?.reduce((sum, d) => sum + d.amount, 0) || 0;

  const availableFunds = totalCollected - totalDisbursed;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="dashboard" staff={{ name: staff.name, role: staff.role }} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ringkasan aktivitas platform AyoBantu</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Kampanye Aktif" value={activeCampaigns || 0} icon="📢" color="blue" />
          <StatCard title="Total Donasi" value={totalDonations || 0} icon="💝" color="green" />
          <StatCard title="Pending Konfirmasi" value={pendingDonations || 0} icon="⏳" color="yellow" />
          <StatCard title="Dana Tersedia" value={formatRupiah(availableFunds)} icon="💰" color="purple" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Terkumpul" value={formatRupiah(totalCollected)} icon="📈" color="green" />
          <StatCard title="Total Dicairkan" value={formatRupiah(totalDisbursed)} icon="📤" color="orange" />
          <StatCard title="Pencairan Dilaporkan" value={reportedDisbursements || 0} icon="✅" color="blue" />
          <StatCard title="Pencairan Total" value={totalDisbursements || 0} icon="📋" color="gray" />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Donasi Terbaru</h2>
                <p className="text-xs text-gray-500 mt-0.5">5 transaksi terakhir</p>
              </div>
              <Link href="/admin/donations" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition">
                Lihat semua →
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentDonations?.map((d) => {
                const campaignTitle = (d.campaigns as unknown as { title: string } | null)?.title || 'N/A';
                return (
                  <div key={d.id} className="px-5 py-4 flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{campaignTitle}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {d.display_name || 'Anonim'} • {formatDate(d.created_at)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-sm">{formatRupiah(d.amount)}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${getStatusColor(d.status)}`}
                      >
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!recentDonations || recentDonations.length === 0) && (
                <div className="px-5 py-8 text-center text-sm text-gray-400">Belum ada donasi</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Pencairan Terbaru</h2>
                <p className="text-xs text-gray-500 mt-0.5">5 pencairan terakhir</p>
              </div>
              <Link href="/admin/disbursements" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition">
                Lihat semua →
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentDisbursements?.map((d) => {
                const campaignTitle = (d.campaigns as unknown as { title: string } | null)?.title || 'N/A';
                return (
                  <div key={d.id} className="px-5 py-4 flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{campaignTitle}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {d.recipient_name} • {formatDate(d.created_at)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-sm">{formatRupiah(d.amount)}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${getDisbursementStatusColor(d.status)}`}
                      >
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!recentDisbursements || recentDisbursements.length === 0) && (
                <div className="px-5 py-8 text-center text-sm text-gray-400">Belum ada pencairan</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    green: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    yellow: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    purple: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    orange: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    gray: 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700',
  };

  return (
    <div
      className={`p-5 rounded-2xl border shadow-sm ${colorClasses[color]} bg-white dark:bg-gray-900 hover:-translate-y-0.5 transition-transform`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        {title}
      </div>
      <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function getStatusColor(status: string): string {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  if (status === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
}

function getDisbursementStatusColor(status: string): string {
  if (status === 'reported') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  if (status === 'disbursed') return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
}
