-- ==========================================
-- FIX 1: Allow Syncing Indian Stocks
-- ==========================================
-- Add policies to allow authenticated users (like the sync process) to insert/update stocks
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.indian_stocks;
CREATE POLICY "Allow authenticated insert"
ON public.indian_stocks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated update" ON public.indian_stocks;
CREATE POLICY "Allow authenticated update"
ON public.indian_stocks
FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ==========================================
-- FIX 2: Fix Crypto Table Name Mismatch
-- ==========================================
-- The code uses 'crypto_coins' but setup script likely made 'crypto_coin'.
-- We will migrate data if needed and ensure 'crypto_coins' is the standard.

DO $$
BEGIN
    -- If 'crypto_coin' exists but 'crypto_coins' does not, rename it.
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crypto_coin') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crypto_coins') THEN
        ALTER TABLE public.crypto_coin RENAME TO crypto_coins;
    END IF;
END $$;

-- If 'crypto_coins' (plural) does not exist (and wasn't just renamed), create it.
CREATE TABLE IF NOT EXISTS public.crypto_coins (
  id text PRIMARY KEY, -- 'bitcoin' (slug)
  symbol text NOT NULL,
  name text NOT NULL,
  image text,
  current_price numeric,
  market_cap numeric,
  market_cap_rank integer,
  price_change_percentage_24h numeric,
  high_24h numeric,
  low_24h numeric,
  
  -- Legacy columns to prevent errors if code still uses them
  price_usd numeric, 
  change_24h numeric, 
  market_cap_usd numeric, 
  volume_24h numeric,
  rank integer,
  
  volume numeric,
  updated_at timestamp with time zone DEFAULT now()
);

-- Basic RLS for crypto_coins
ALTER TABLE public.crypto_coins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.crypto_coins;
CREATE POLICY "Enable read access for all users" ON public.crypto_coins FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.crypto_coins;
CREATE POLICY "Enable insert for authenticated users" 
ON public.crypto_coins FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.crypto_coins;
CREATE POLICY "Enable update for authenticated users" 
ON public.crypto_coins FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ==========================================
-- FIX 3: Prediction Column Types & Missing Columns
-- ==========================================
-- Ensure user_id is properly typed as UUID
DO $$
BEGIN
    BEGIN
        ALTER TABLE stock_predictions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        ALTER TABLE crypto_predictions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- Add missing columns if they don't exist
ALTER TABLE public.stock_predictions ADD COLUMN IF NOT EXISTS prediction_valid_till_ist timestamp with time zone;
ALTER TABLE public.crypto_predictions ADD COLUMN IF NOT EXISTS prediction_valid_till_ist timestamp with time zone;
