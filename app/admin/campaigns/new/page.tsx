import { requireStaff } from '@/lib/auth/staff';
import CampaignForm from '../_components/CampaignForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage() {
  await requireStaff(['admin']);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin/campaigns" className="text-blue-600 hover:underline">
            ← Kembali ke Daftar Kampanye
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Buat Kampanye Baru</h1>
        <CampaignForm />
      </main>
    </div>
  );
}
