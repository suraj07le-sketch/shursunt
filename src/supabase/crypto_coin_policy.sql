-- Enable RLS on the table (if not already enabled)
alter table public.crypto_coin enable row level security;

-- Drop existing policy if it conflicts
drop policy if exists "Enable read access for all users" on public.crypto_coin;

-- Create a policy to allow anyone (anon and authenticated) to read data
create policy "Enable read access for all users"
on public.crypto_coin
for select
using (true);
