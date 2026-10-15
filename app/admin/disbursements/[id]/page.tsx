import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DisbursementStatus from './_components/DisbursementStatus';
import ProofUpload from './_components/ProofUpload';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DisbursementDetailPage({ params }: Props) {
  await requireStaff();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin/disbursements" className="text-blue-600 hover:underline">
            ← Kembali ke Pencairan
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Detail Pencairan</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Informasi Pencairan</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Kampanye</div>
                  <div className="font-medium">{campaign?.title}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Kategori</div>
                  <div className="font-medium">{disbursement.category}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Jumlah</div>
                  <div className="font-bold text-blue-600">Rp{disbursement.amount.toLocaleString('id-ID')}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Penerima</div>
                  <div className="font-medium">{disbursement.recipient_name}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Dibuat Oleh</div>
                  <div className="font-medium">{creator?.name}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Dibuat</div>
                  <div className="font-medium">{new Date(disbursement.created_at).toLocaleString('id-ID')}</div>
                </div>
                {disbursement.disbursed_at && (
                  <div className="col-span-2">
                    <div className="text-gray-600 dark:text-gray-400">Dicairkan</div>
                    <div className="font-medium">{new Date(disbursement.disbursed_at).toLocaleString('id-ID')}</div>
                  </div>
                )}
                {disbursement.description && (
                  <div className="col-span-2">
                    <div className="text-gray-600 dark:text-gray-400">Deskripsi</div>
                    <div className="font-medium">{disbursement.description}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Bukti Pencairan</h2>
              {proofs && proofs.length > 0 ? (
                <div className="space-y-3">
                  {proofs.map((proof) => {
                    const uploader = (proof.staff_profiles as Array<{ name: string }> | null)?.[0] || null;
                    return (
                      <div key={proof.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="font-medium text-sm">{proof.kind}</div>
                          <div className="text-xs text-gray-500">
                            Oleh {uploader?.name} • {new Date(proof.uploaded_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <a 
                          href={proof.file_url} 
                          target="_blank" 
                          rel="noopener"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Lihat
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">Belum ada bukti</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Status</h2>
              <DisbursementStatus 
                disbursementId={id} 
                currentStatus={disbursement.status as 'planned' | 'disbursed' | 'reported'}
              />
            </div>

            {disbursement.status === 'disbursed' && (
              <ProofUpload disbursementId={id} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}