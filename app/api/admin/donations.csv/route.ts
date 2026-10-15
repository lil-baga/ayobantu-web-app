import { requireStaff } from '@/lib/auth/staff';
import { createAdminClient } from '@/lib/supabase/admin';
import { decrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await requireStaff(['admin', 'finance']);

  const supabase = createAdminClient();
  const { data: donations } = await supabase
    .from('donations')
    .select(`
      id, amount, status, display_name, is_anonymous, created_at, paid_at,
      campaigns (title),
      donor_contacts (email_enc, phone_enc)
    `)
    .order('created_at', { ascending: false });

  if (!donations) {
    return NextResponse.json({ error: 'Gagal mengambil data donasi' }, { status: 500 });
  }

  // CSV headers
  const headers = ['ID', 'Kampanye', 'Nama Donatur', 'Email', 'Telepon', 'Jumlah', 'Status', 'Tanggal Donasi', 'Tanggal Bayar'];
  
  // CSV rows
  const rows = donations.map((d: any) => {
    const campaign = (d.campaigns as Array<{ title: string }> | null)?.[0]?.title || '-';
    const donor = d.donor_contacts as Array<{ email_enc: string; phone_enc: string }> | null;
    
    let email = '-';
    let phone = '-';
    
    if (donor?.[0]) {
      try {
        if (donor[0].email_enc) email = decrypt(donor[0].email_enc);
        if (donor[0].phone_enc) phone = decrypt(donor[0].phone_enc);
      } catch {
        email = '[decrypt error]';
        phone = '[decrypt error]';
      }
    }

    return [
      d.id,
      campaign,
      d.is_anonymous ? 'Anonim' : (d.display_name || '-'),
      email,
      phone,
      d.amount,
      d.status,
      new Date(d.created_at).toISOString().split('T')[0],
      d.paid_at ? new Date(d.paid_at).toISOString().split('T')[0] : '-',
    ];
  });

  // Escape CSV values
  const escapeCsv = (val: any) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV
  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="donasi-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
