-- Ensure watchlist table exists and has RLS enabled
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  coin_id text not null,
  coin_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.watchlist enable row level security;

-- Ensure asset_type column exists
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'watchlist' and column_name = 'asset_type') then
    alter table public.watchlist add column asset_type text check (asset_type in ('crypto', 'stock')) default 'stock';
  end if;
end $$;

-- Drop existing policies to prevent conflicts
drop policy if exists "Users can view own watchlist" on public.watchlist;
drop policy if exists "Users can insert own watchlist" on public.watchlist;
drop policy if exists "Users can update own watchlist" on public.watchlist;
drop policy if exists "Users can delete own watchlist" on public.watchlist;
drop policy if exists "Enable all for users based on user_id" on public.watchlist;

-- Create comprehensive RLS policy
create policy "Enable all for users based on user_id"
on public.watchlist
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
