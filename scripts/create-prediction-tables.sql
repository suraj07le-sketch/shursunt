-- =====================================================
-- PREDICTION SYSTEM DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PREDICTION MODELS TABLE
-- Stores ML model data for predictions
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) NOT NULL UNIQUE,
    model_data JSONB NOT NULL,
    confidence DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prediction_models_symbol ON prediction_models(symbol);

-- =====================================================
-- STOCK MODELS TABLE  
-- Stores LSTM model data for stock predictions
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_name VARCHAR(100) NOT NULL UNIQUE,
    model_artifacts JSONB NOT NULL,
    confidence DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_models_name ON stock_models(stock_name);

-- =====================================================
-- STOCK PREDICTIONS TABLE
-- Stores individual stock predictions
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_name VARCHAR(100) NOT NULL,
    current_price DECIMAL(15,2) NOT NULL,
    predicted_price DECIMAL(15,2) NOT NULL,
    prediction_change_percent DECIMAL(10,4),
    confidence DECIMAL(5,2) NOT NULL,
    trend VARCHAR(20) NOT NULL,
    stop_loss_price DECIMAL(15,2),
    macro_bias VARCHAR(20),
    timeframe VARCHAR(10) DEFAULT '4h',
    model VARCHAR(100) DEFAULT 'v4-elite-ensemble-lstm',
    status VARCHAR(20) DEFAULT 'completed',
    prediction_time_ist TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_stock_predictions_user ON stock_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_predictions_time ON stock_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_predictions_user_time ON stock_predictions(user_id, created_at);

-- =====================================================
-- CRYPTO PREDICTIONS TABLE
-- Stores individual crypto predictions
-- =====================================================
CREATE TABLE IF NOT EXISTS crypto_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coin VARCHAR(50) NOT NULL,
    coin_id VARCHAR(100),
    current_price DECIMAL(20,4) NOT NULL,
    predicted_price DECIMAL(20,4) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    trend VARCHAR(20) NOT NULL,
    stop_loss DECIMAL(20,4),
    timeframe VARCHAR(10) DEFAULT '4h',
    model_used VARCHAR(100) DEFAULT 'v2-deep-lstm-5000',
    status VARCHAR(20) DEFAULT 'completed',
    macro_bias VARCHAR(20),
    prediction_change_percent DECIMAL(10,4),
    predicted_time_ist TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_crypto_predictions_user ON crypto_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_predictions_time ON crypto_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_crypto_predictions_user_time ON crypto_predictions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_crypto_predictions_coin ON crypto_predictions(coin);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE prediction_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_predictions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Prediction models: Public read access (needed for predictions)
CREATE POLICY "Enable read access for prediction models" ON prediction_models
    FOR SELECT USING (true);

-- Prediction models: Service role write access
CREATE POLICY "Enable service role insert/update for prediction models" ON prediction_models
    FOR ALL USING (true);

-- Stock models: Public read access
CREATE POLICY "Enable read access for stock models" ON stock_models
    FOR SELECT USING (true);

-- Stock models: Service role write access
CREATE POLICY "Enable service role insert/update for stock models" ON stock_models
    FOR ALL USING (true);

-- Stock predictions: Users can see their own predictions + public demo predictions
CREATE POLICY "Users can view their own stock predictions" ON stock_predictions
    FOR SELECT USING (
        user_id = auth.uid() 
        OR user_id = '00000000-0000-0000-0000-000000000000' -- Demo account
    );

-- Stock predictions: Authenticated users can insert their own predictions
CREATE POLICY "Users can insert their own stock predictions" ON stock_predictions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Stock predictions: Service role can do anything
CREATE POLICY "Service role full access to stock predictions" ON stock_predictions
    FOR ALL USING (true);

-- Crypto predictions: Users can see their own predictions + public demo predictions
CREATE POLICY "Users can view their own crypto predictions" ON crypto_predictions
    FOR SELECT USING (
        user_id = auth.uid() 
        OR user_id = '00000000-0000-0000-0000-000000000000' -- Demo account
    );

-- Crypto predictions: Authenticated users can insert their own predictions
CREATE POLICY "Users can insert their own crypto predictions" ON crypto_predictions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Crypto predictions: Service role can do anything
CREATE POLICY "Service role full access to crypto predictions" ON crypto_predictions
    FOR ALL USING (true);

-- =====================================================
-- FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
DROP TRIGGER IF EXISTS update_prediction_models_updated_at ON prediction_models;
CREATE TRIGGER update_prediction_models_updated_at
    BEFORE UPDATE ON prediction_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_models_updated_at ON stock_models;
CREATE TRIGGER update_stock_models_updated_at
    BEFORE UPDATE ON stock_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================
-- Insert a demo user prediction for testing
INSERT INTO stock_predictions (
    user_id, stock_name, current_price, predicted_price, confidence, 
    trend, macro_bias, model, status
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Demo user ID
    'RELIANCE',
    2850.50,
    2920.75,
    78.5,
    'UP',
    'BULLISH',
    'v4-elite-ensemble-lstm',
    'completed'
) ON CONFLICT DO NOTHING;

INSERT INTO crypto_predictions (
    user_id, coin, current_price, predicted_price, confidence, 
    trend, model_used, status
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Demo user ID
    'BTC',
    43250.00,
    44100.00,
    82.0,
    'UP',
    'v2-deep-lstm-5000',
    'completed'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%prediction%' 
ORDER BY table_name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Prediction System Database Schema Created!';
    RAISE NOTICE 'Tables: prediction_models, stock_models,';
    RAISE NOTICE '         stock_predictions, crypto_predictions';
    RAISE NOTICE 'RLS Policies: Configured';
    RAISE NOTICE '================================================';
END $$;
