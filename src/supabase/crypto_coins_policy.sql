-- Enable RLS on the plural table
alter table public.crypto_coins enable row level security;

-- Drop existing policy if it conflicts
drop policy if exists "Enable read access for all users" on public.crypto_coins;

-- Create a policy to allow anyone to read data
create policy "Enable read access for all users"
on public.crypto_coins
for select
using (true);
