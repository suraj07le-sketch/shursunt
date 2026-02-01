-- Allow Service Role (Webhooks/Admin) to bypass RLS
-- Run this in Supabase SQL Editor

-- 1. Crypto Predictions
CREATE POLICY "Enable insert for service role"
ON crypto_predictions
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable select for service role"
ON crypto_predictions
FOR SELECT
TO service_role
USING (true);

-- 2. Stock Predictions
CREATE POLICY "Enable insert for service role"
ON stock_predictions
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable select for service role"
ON stock_predictions
FOR SELECT
TO service_role
USING (true);
