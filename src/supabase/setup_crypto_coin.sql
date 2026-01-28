-- Create the crypto_coin table if it doesn't exist
create table if not exists public.crypto_coin (
  id text primary key, -- 'bitcoin', 'ethereum', etc.
  symbol text not null,
  name text not null,
  image text,
  current_price numeric,
  market_cap numeric,
  market_cap_rank integer,
  price_change_percentage_24h numeric,
  high_24h numeric,
  low_24h numeric,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.crypto_coin enable row level security;

-- Allow public read access
drop policy if exists "Enable read access for all users" on public.crypto_coin;
create policy "Enable read access for all users"
  on public.crypto_coin for select
  using (true);

-- Allow authenticated users (e.g., you or the script) to insert/update
drop policy if exists "Enable insert for authenticated users" on public.crypto_coin;
create policy "Enable insert for authenticated users"
  on public.crypto_coin for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');
