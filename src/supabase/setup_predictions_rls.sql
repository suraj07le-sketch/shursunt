-- Setup RLS policies for stock_predictions and crypto_predictions tables
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Fix column types (uuid = text issue)
-- ============================================

-- Convert user_id from text to uuid with explicit casting
ALTER TABLE stock_predictions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE crypto_predictions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- ============================================
-- STEP 2: Enable RLS on tables
-- ============================================

ALTER TABLE stock_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_predictions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own stock predictions" ON stock_predictions;
DROP POLICY IF EXISTS "Users can insert own stock predictions" ON stock_predictions;
DROP POLICY IF EXISTS "Users can view own crypto predictions" ON crypto_predictions;
DROP POLICY IF EXISTS "Users can insert own crypto predictions" ON crypto_predictions;

-- Create RLS policies for stock_predictions
CREATE POLICY "Users can view own stock predictions"
ON stock_predictions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stock predictions"
ON stock_predictions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for crypto_predictions
CREATE POLICY "Users can view own crypto predictions"
ON crypto_predictions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own crypto predictions"
ON crypto_predictions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================

SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('stock_predictions', 'crypto_predictions')
ORDER BY tablename, policyname;
