import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import CampaignForm from '../../_components/CampaignForm';
import Link from 'next/link';
import AdminNav from '../../../_components/AdminNav';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: Props) {
  const staff = await requireStaff(['admin']);
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!campaign) notFound();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="campaigns" staff={{ name: staff.name, role: staff.role }} />
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link 
            href="/admin/campaigns" 
            className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition inline-flex items-center gap-1 mb-3"
          >
            ← Kembali ke Daftar Kampanye
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Edit Kampanye</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{campaign.title}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sm:p-8">
          <CampaignForm campaign={campaign} />
        </div>
      </main>
    </div>
  );
}
