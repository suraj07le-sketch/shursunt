-- =====================================================
-- ADD PREDICTION VALIDITY COLUMNS
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add prediction_valid_till_ist column to stock_predictions
ALTER TABLE stock_predictions 
ADD COLUMN IF NOT EXISTS prediction_valid_till_ist TIMESTAMPTZ;

-- Add prediction_valid_till_ist column to crypto_predictions
ALTER TABLE crypto_predictions 
ADD COLUMN IF NOT EXISTS prediction_valid_till_ist TIMESTAMPTZ;

-- Add index for faster queries on validity
CREATE INDEX IF NOT EXISTS idx_stock_predictions_validity 
ON stock_predictions(prediction_valid_till_ist);

CREATE INDEX IF NOT EXISTS idx_crypto_predictions_validity 
ON crypto_predictions(prediction_valid_till_ist);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stock_predictions' 
AND column_name = 'prediction_valid_till_ist';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'crypto_predictions' 
AND column_name = 'prediction_valid_till_ist';
