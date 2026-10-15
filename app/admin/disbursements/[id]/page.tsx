import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DisbursementStatus from './_components/DisbursementStatus';
import ProofUpload from './_components/ProofUpload';
import AdminNav from '../../_components/AdminNav';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DisbursementDetailPage({ params }: Props) {
  const staff = await requireStaff();
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: disbursement } = await supabase
    .from('disbursements')
    .select(`
      id, amount, category, description, recipient_name, 
      status, disbursed_at, created_at,
      campaigns (title, slug),
      staff_profiles (name)
    `)
    .eq('id', id)
    .single();

  if (!disbursement) notFound();

  const { data: proofs } = await supabase
    .from('disbursement_proofs')
    .select('id, file_url, kind, uploaded_at, staff_profiles (name)')
    .eq('disbursement_id', id)
    .order('uploaded_at', { ascending: false });

  const campaign = (disbursement.campaigns as Array<{ title: string; slug: string }> | null)?.[0] || null;
  const creator = (disbursement.staff_profiles as Array<{ name: string }> | null)?.[0] || null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      <AdminNav currentPath="disbursements" staff={{ name: staff.name, role: staff.role }} />
      
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link 
            href="/admin/disbursements" 
            className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition inline-flex items-center gap-1 mb-3"
          >
            ← Kembali ke Pencairan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Detail Pencairan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{campaign?.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">Informasi Pencairan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Kampanye</div>
                  <div className="font-semibold text-base text-gray-900 dark:text-white">{campaign?.title}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Kategori</div>
                  <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {disbursement.category}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Jumlah</div>
                  <div className="font-black text-xl text-blue-600 dark:text-blue-400">Rp{disbursement.amount.toLocaleString('id-ID')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Penerima</div>
                  <div className="font-semibold text-base text-gray-900 dark:text-white">{disbursement.recipient_name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dibuat Oleh</div>
                  <div className="font-medium text-gray-900 dark:text-white">{creator?.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dibuat</div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">{new Date(disbursement.created_at).toLocaleString('id-ID')}</div>
                </div>
                {disbursement.disbursed_at && (
                  <div className="col-span-full space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dicairkan</div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">{new Date(disbursement.disbursed_at).toLocaleString('id-ID')}</div>
                  </div>
                )}
                {disbursement.description && (
                  <div className="col-span-full space-y-1 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deskripsi</div>
                    <div className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{disbursement.description}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">Bukti Pencairan</h2>
              {proofs && proofs.length > 0 ? (
                <div className="space-y-3">
                  {proofs.map((proof) => {
                    const uploader = (proof.staff_profiles as Array<{ name: string }> | null)?.[0] || null;
                    return (
                      <div key={proof.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-gray-200/80 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-900 transition">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">{proof.kind}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Oleh {uploader?.name} • {new Date(proof.uploaded_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <a 
                          href={proof.file_url} 
                          target="_blank" 
                          rel="noopener"
                          className="ml-4 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                        >
                          Lihat →
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">Belum ada bukti diunggah</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-bold mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">Status</h2>
              <DisbursementStatus 
                disbursementId={id} 
                currentStatus={disbursement.status as 'planned' | 'disbursed' | 'reported'}
              />
            </div>

            {disbursement.status === 'disbursed' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6">
                <ProofUpload disbursementId={id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
