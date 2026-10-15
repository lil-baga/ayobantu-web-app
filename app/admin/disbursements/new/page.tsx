import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import DisbursementForm from '../_components/DisbursementForm';

export const dynamic = 'force-dynamic';

export default async function NewDisbursementPage() {
  await requireStaff();
  
  const supabase = createAdminClient();
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, title, slug')
    .eq('status', 'active')
    .order('title');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin/disbursements" className="text-blue-600 hover:underline">
            ← Kembali ke Pencairan
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Buat Pencairan Baru</h1>
        <DisbursementForm campaigns={campaigns || []} />
      </main>
    </div>
  );
}
