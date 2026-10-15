import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type StaffRole = 'admin' | 'finance';

export interface StaffProfile {
  id: string;
  name: string;
  role: StaffRole;
  is_active: boolean;
}

/** Get current staff profile. Redirects to login if not authenticated/not staff. */
export async function requireStaff(allowedRoles?: StaffRole[]): Promise<StaffProfile> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('id, name, role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active) {
    redirect('/admin/login');
  }

  if (allowedRoles && !allowedRoles.includes(profile.role as StaffRole)) {
    redirect('/admin/login');
  }

  return profile as StaffProfile;
}

/** Get current staff or null (no redirect) */
export async function getStaff(): Promise<StaffProfile | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('id, name, role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return profile as StaffProfile;
}
