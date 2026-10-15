import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import DisbursementForm from '../_components/DisbursementForm';
import AdminNav from '../../_components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function NewDisbursementPage() {
  const staff = await requireStaff();
  
  const supabase = createAdminClient();
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, title, slug')
    .eq('status', 'active')
    .order('title');

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="disbursements" staff={{ name: staff.name, role: staff.role }} />
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link 
            href="/admin/disbursements" 
            className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition inline-flex items-center gap-1 mb-3"
          >
            ← Kembali ke Pencairan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Buat Pencairan Baru</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rekam penyaluran dana kepada penerima manfaat</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sm:p-8">
          <DisbursementForm campaigns={campaigns || []} />
        </div>
      </main>
    </div>
  );
}
