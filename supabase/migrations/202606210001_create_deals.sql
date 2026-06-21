create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  network text not null check (network in ('testnet', 'public')),
  contract_id text not null,
  contract_deal_id text not null,
  tx_hash text not null,
  deal_type text not null check (deal_type in ('Service', 'DigitalGoods', 'Custom')),
  title text not null,
  description text not null,
  seller_address text not null,
  buyer_address text not null,
  resolver_address text not null,
  asset_address text not null,
  amount_stroops numeric(39, 0) not null check (amount_stroops > 0),
  terms_hash text not null,
  metadata jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (network, contract_id, contract_deal_id)
);

create index if not exists deals_seller_address_idx on public.deals (seller_address, created_at desc);
create index if not exists deals_buyer_address_idx on public.deals (buyer_address, created_at desc);

alter table public.deals enable row level security;

create policy "deal metadata is publicly readable"
on public.deals for select
using (true);

comment on table public.deals is 'Public off-chain metadata cryptographically bound to AmanPay terms_hash.';
