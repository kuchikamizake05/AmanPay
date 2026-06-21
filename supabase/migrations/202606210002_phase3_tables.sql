-- Create auth_challenges table
create table if not exists public.auth_challenges (
  wallet text not null,
  challenge_xdr text not null,
  nonce text primary key,
  expires_at timestamptz not null,
  consumed_at timestamptz
);

-- Create deal_events table
create table if not exists public.deal_events (
  id uuid primary key default gen_random_uuid(),
  contract_deal_id text not null,
  event_type text not null,
  actor text not null,
  tx_hash text not null unique,
  resulting_status text not null,
  metadata_hash text,
  ledger bigint not null,
  created_at timestamptz not null default now()
);

-- Create deliveries table
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  contract_deal_id text not null,
  revision integer not null,
  private_url text not null,
  private_note text not null,
  payload jsonb not null,
  hash text not null,
  submitter text not null,
  created_at timestamptz not null default now()
);

-- Create deal_private_notes table
create table if not exists public.deal_private_notes (
  id uuid primary key default gen_random_uuid(),
  contract_deal_id text not null,
  revision_number integer,
  note_type text not null check (note_type in ('revision_reason', 'dispute_reason')),
  opener text,
  buyer text,
  reason text not null,
  evidence_url text,
  payload jsonb not null,
  hash text not null,
  created_at timestamptz not null default now()
);

-- Indexes for efficient queries
create index if not exists deal_events_contract_deal_id_idx on public.deal_events (contract_deal_id, created_at desc);
create index if not exists deliveries_contract_deal_id_idx on public.deliveries (contract_deal_id, revision desc);
create index if not exists deal_private_notes_contract_deal_id_idx on public.deal_private_notes (contract_deal_id, created_at desc);

-- Enable Row Level Security (RLS)
alter table public.auth_challenges enable row level security;
alter table public.deal_events enable row level security;
alter table public.deliveries enable row level security;
alter table public.deal_private_notes enable row level security;

-- Policies
create policy "deal events are publicly readable"
  on public.deal_events for select
  using (true);

-- Other tables (auth_challenges, deliveries, deal_private_notes) do not have public SELECT/INSERT/UPDATE policies,
-- which restricts access exclusively to authenticated server routes using the admin/service role client.
