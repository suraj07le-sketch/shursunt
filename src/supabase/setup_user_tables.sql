-- Create Watchlist Table
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  coin_id text not null,
  coin_data jsonb,
  created_at timestamp with time zone default now(),
  unique(user_id, coin_id)
);

-- Enable RLS for Watchlist
alter table public.watchlist enable row level security;

-- Watchlist Policies
drop policy if exists "Users can view their own watchlist" on public.watchlist;
create policy "Users can view their own watchlist"
  on public.watchlist for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add to their watchlist" on public.watchlist;
create policy "Users can add to their watchlist"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove from their watchlist" on public.watchlist;
create policy "Users can remove from their watchlist"
  on public.watchlist for delete
  using (auth.uid() = user_id);


-- Create Predictions Table
create table if not exists public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  coin_id text not null,
  coin_name text,
  predicted_price numeric,
  status text check (status in ('pending', 'completed', 'failed')) default 'pending',
  timeframe text,
  created_at timestamp with time zone default now()
);

-- Enable RLS for Predictions
alter table public.predictions enable row level security;

-- Predictions Policies
drop policy if exists "Users can view their own predictions" on public.predictions;
create policy "Users can view their own predictions"
  on public.predictions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create predictions" on public.predictions;
create policy "Users can create predictions"
  on public.predictions for insert
  with check (auth.uid() = user_id);
