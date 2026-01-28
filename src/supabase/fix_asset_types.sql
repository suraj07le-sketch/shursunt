
-- Fix Watchlist: Set asset_type to 'crypto' where the coin_id exists in crypto_coins table
UPDATE public.watchlist
SET asset_type = 'crypto'
WHERE coin_id IN (SELECT id FROM public.crypto_coins);

-- Fix Predictions: Set asset_type to 'crypto' where the coin_id exists in crypto_coins table
UPDATE public.predictions
SET asset_type = 'crypto'
WHERE coin_id IN (SELECT id FROM public.crypto_coins);
