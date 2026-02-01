-- Query to list all predictions grouped by User ID
-- Run this in the Supabase SQL Editor

SELECT 
    p.user_id,
    'crypto' as type,
    p.coin as asset,
    p.timeframe,
    p.created_at
FROM crypto_predictions p

UNION ALL

SELECT 
    s.user_id,
    'stock' as type,
    s.stock_name as asset,
    s.timeframe,
    s.created_at
FROM stock_predictions s

ORDER BY user_id, created_at DESC;
