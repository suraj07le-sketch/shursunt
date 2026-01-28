-- Add asset_type to Watchlist
alter table public.watchlist 
add column if not exists asset_type text check (asset_type in ('crypto', 'stock')) default 'stock';

-- Add asset_type to Predictions
alter table public.predictions 
add column if not exists asset_type text check (asset_type in ('crypto', 'stock')) default 'stock';

-- Optional: Backfill existing data if needed (assuming defaults handle it nicely or we update manually)
-- update public.watchlist set asset_type = 'crypto' where ... (difficult without knowing IDs, defaults to 'stock' is safer for now as we just added stocks)
