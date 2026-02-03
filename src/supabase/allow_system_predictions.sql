-- =========================================================
-- Allow Access to System Predictions (User ID: 00000000-0000-0000-0000-000000000000)
-- Run this in Supabase SQL Editor
-- =========================================================

-- 1. Update Stock Predictions Policy
DROP POLICY IF EXISTS "Users can view own stock predictions" ON stock_predictions;

CREATE POLICY "Users can view own and system stock predictions"
ON stock_predictions FOR SELECT
USING (
  user_id = auth.uid() OR 
  user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- 2. Update Crypto Predictions Policy
DROP POLICY IF EXISTS "Users can view own crypto predictions" ON crypto_predictions;

CREATE POLICY "Users can view own and system crypto predictions"
ON crypto_predictions FOR SELECT
USING (
  user_id = auth.uid() OR 
  user_id = '00000000-0000-0000-0000-000000000000'::uuid
);
