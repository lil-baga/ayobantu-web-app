import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  await requireStaff(['admin', 'finance']);

  const supabase = createAdminClient();
  const { data: donations } = await supabase
    .from('donations')
    .select(`
      id, amount, status, display_name, is_anonymous, created_at, paid_at,
      campaigns (title, slug)
    `)
    .order('created_at', { ascending: false });

  if (!donations) {
    return NextResponse.json({ error: 'No data' }, { status: 500 });
  }

  // Build CSV (without contact data)
  const headers = ['ID', 'Kampanye', 'Jumlah', 'Status', 'Donatur', 'Anonim', 'Dibuat', 'Dibayar'];
  const rows = donations.map((d: any) => {
    const campaign = (d.campaigns as Array<{ title: string }> | null)?.[0] || null;
    return [
      d.id,
      campaign?.title || '',
      d.amount,
      d.status,
      d.is_anonymous ? 'Anonim' : (d.display_name || 'Hamba Allah'),
      d.is_anonymous ? 'Ya' : 'Tidak',
      new Date(d.created_at).toISOString(),
      d.paid_at ? new Date(d.paid_at).toISOString() : '',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(',')),
  ].join('\n');

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="donations.csv"',
    },
  });
}