-- Create Watchlist Table
create table watchlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  coin_id text not null,
  coin_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, coin_id)
);

-- Create Predictions Table
create table predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  coin_id text not null,
  coin_name text not null,
  timeframe text not null,
  predicted_price numeric,
  status text check (status in ('pending', 'completed', 'failed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table watchlist enable row level security;
alter table predictions enable row level security;

-- Watchlist Policies
create policy "Users can view their own watchlist"
  on watchlist for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own watchlist"
  on watchlist for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
  on watchlist for delete
  using (auth.uid() = user_id);

-- Prediction Policies
create policy "Users can view their own predictions"
  on predictions for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own predictions"
  on predictions for insert
  with check (auth.uid() = user_id);
