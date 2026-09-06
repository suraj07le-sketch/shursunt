-- Run this in the Supabase SQL Editor to enable outcome tracking
-- This adds WIN/LOSS tracking so the engine can learn from past predictions

ALTER TABLE crypto_predictions ADD COLUMN IF NOT EXISTS outcome TEXT;         -- 'WIN' | 'LOSS' | 'PENDING'
ALTER TABLE crypto_predictions ADD COLUMN IF NOT EXISTS was_correct BOOLEAN;  -- TRUE = signal was right

ALTER TABLE stock_predictions  ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE stock_predictions  ADD COLUMN IF NOT EXISTS was_correct BOOLEAN;

-- Index for fast win-rate queries
CREATE INDEX IF NOT EXISTS idx_crypto_pred_asset_correct ON crypto_predictions (coin, was_correct);
CREATE INDEX IF NOT EXISTS idx_stock_pred_asset_correct  ON stock_predictions  (stock_name, was_correct);

-- To manually mark a prediction as correct (example):
-- UPDATE crypto_predictions SET was_correct = true, outcome = 'WIN' WHERE id = '<prediction-id>';
-- UPDATE crypto_predictions SET was_correct = false, outcome = 'LOSS' WHERE id = '<prediction-id>';
