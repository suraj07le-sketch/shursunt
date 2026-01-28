-- Add missing columns to the predictions table to support the UI
alter table public.predictions 
add column if not exists trend text, -- 'UP', 'DOWN'
add column if not exists confidence numeric, -- 0-100
add column if not exists current_price numeric,
add column if not exists predicted_time timestamp with time zone,
add column if not exists asset_type text default 'crypto'; -- 'stock', 'crypto'

-- Ensure policies allow update/insert matching the new schema if needed (policies usually cover row-level, not column-level, so existing ones should be fine)
-- Just in case, re-verify policies
drop policy if exists "Enable read access for own predictions" on public.predictions;
create policy "Enable read access for own predictions"
  on public.predictions for select
  using (auth.uid() = user_id);

drop policy if exists "Enable insert for own predictions" on public.predictions;
create policy "Enable insert for own predictions"
  on public.predictions for insert
  with check (auth.uid() = user_id);
  
drop policy if exists "Enable update for own predictions" on public.predictions;
create policy "Enable update for own predictions"
  on public.predictions for update
  using (auth.uid() = user_id);
