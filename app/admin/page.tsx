import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireStaff(['admin', 'finance']);

  const supabase = createAdminClient();

  // Fetch stats in parallel
  const [
    { count: totalCampaigns },
    { count: activeCampaigns },
    { count: totalDonations },
    { count: pendingDonations },
    { count: paidDonations },
    { count: totalDisbursements },
    { count: reportedDisbursements },
    { data: recentDonations },
    { data: recentDisbursements },
  ] = await Promise.all([
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('donations').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase.from('disbursements').select('*', { count: 'exact', head: true }),
    supabase.from('disbursements').select('*', { count: 'exact', head: true }).eq('status', 'reported'),
    supabase
      .from('donations')
      .select('id, amount, status, display_name, created_at, campaigns(title)')
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">AyoBantu Admin</h1>
            <div className="flex gap-4 text-sm">
              <Link href="/admin/campaigns" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Kampanye</Link>
              <Link href="/admin/donations" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Donasi</Link>
              <Link href="/admin/disbursements" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Pencairan</Link>
              <Link href="/admin/campaign-updates" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Update</Link>
            </div>
          </div>
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            MODE LOKAL
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Donasi Terbaru</h2>
              <Link href="/admin/donations" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentDonations?.map((d: any) => (
                <div key={d.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{d.campaigns?.title || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{d.display_name || 'Anonim'} • {formatDate(d.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatRupiah(d.amount)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(d.status)}`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!recentDonations || recentDonations.length === 0) && (
                <div className="p-4 text-center text-gray-500">Belum ada donasi</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Pencairan Terbaru</h2>
              <Link href="/admin/disbursements" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentDisbursements?.map((d: any) => (
                <div key={d.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{d.campaigns?.title || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{d.recipient_name} • {formatDate(d.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatRupiah(d.amount)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${getDisbursementStatusColor(d.status)}`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!recentDisbursements || recentDisbursements.length === 0) && (
                <div className="p-4 text-center text-gray-500">Belum ada pencairan</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <span className={`${colors[color as keyof typeof colors] || colors.gray} p-3 rounded-full text-2xl`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function formatRupiah(amount: number): string {
  return 'Rp' + (amount / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'k';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    case 'refunded': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  }
}

function getDisbursementStatusColor(status: string): string {
  switch (status) {
    case 'reported': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    case 'disbursed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    case 'planned': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  }
}