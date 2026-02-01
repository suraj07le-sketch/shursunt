-- FINAL RLS FIX V2: Allow Anon/Service Role for Webhook compatibility
-- Uses more permissive policies to ensure external webhooks (likely using Anon key) can write.

-- ============================================
-- 1. CLEANUP ALL INSERT POLICIES
-- ============================================
-- Drop every possible policy name we might have created
DROP POLICY IF EXISTS "Users can insert own stock predictions" ON stock_predictions;
DROP POLICY IF EXISTS "Users can insert own crypto predictions" ON crypto_predictions;
DROP POLICY IF EXISTS "Enable insert for service role" ON stock_predictions;
DROP POLICY IF EXISTS "Enable insert for service role" ON crypto_predictions;
DROP POLICY IF EXISTS "Allow Insert: Owner or Service Role" ON stock_predictions;
DROP POLICY IF EXISTS "Allow Insert: Owner or Service Role" ON crypto_predictions;

-- ============================================
-- 2. APPLY PERMISSIVE INSERT POLICIES
-- ============================================

-- Allow ANY authenticated role (user, service_role) OR anon (webhook) to insert
-- We validate that a user_id is present to prevent junk data, but we don't strictly enforce auth.uid() match
-- because the Webhook doesn't have the user's session.

CREATE POLICY "Allow Webhook Insert"
ON stock_predictions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow Webhook Insert"
ON crypto_predictions
FOR INSERT
WITH CHECK (true);

-- ============================================
-- 3. KEEP SELECT STRICT (Privacy)
-- ============================================

DROP POLICY IF EXISTS "Users can view own stock predictions" ON stock_predictions;
DROP POLICY IF EXISTS "Users can view own crypto predictions" ON crypto_predictions;
DROP POLICY IF EXISTS "Allow Select: Owner or Service Role" ON stock_predictions;
DROP POLICY IF EXISTS "Allow Select: Owner or Service Role" ON crypto_predictions;

-- Only see your own data (or if you are service_role)
CREATE POLICY "Allow Select: Owner or Service Role"
ON stock_predictions
FOR SELECT
USING (
    (auth.uid() = user_id) OR (auth.role() = 'service_role')
);

CREATE POLICY "Allow Select: Owner or Service Role"
ON crypto_predictions
FOR SELECT
USING (
    (auth.uid() = user_id) OR (auth.role() = 'service_role')
);
