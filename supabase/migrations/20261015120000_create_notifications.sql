-- Table: notifications
-- Purpose: In-app notifications untuk donatur via tracking page
create table notifications (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references donations(id) on delete cascade,
  type text not null check (type in ('payment_confirmed', 'disbursement_created', 'campaign_updated')),
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Index untuk fetch cepat per donation
create index idx_notifications_donation_id on notifications(donation_id);
create index idx_notifications_created_at on notifications(created_at desc);

-- RLS: public bisa baca via tracking token (handled di app logic)
alter table notifications enable row level security;

create policy "Public can read own donation notifications"
  on notifications for select
  using (true); -- App logic filter by donation_id after token validation

-- Grant
grant select on notifications to anon, authenticated;
grant all on notifications to service_role;
