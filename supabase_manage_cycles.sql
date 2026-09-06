-- ==========================================
-- SUPABASE 6-DAY SESSION & CROP MANAGER
-- This script ensures only one session is created every 6 days
-- and crops (deletes) old prediction data concurrently.
-- ==========================================

CREATE OR REPLACE FUNCTION public.manage_6day_cycle()
RETURNS void AS $$
DECLARE
    last_session_date TIMESTAMPTZ;
BEGIN
    -- 1. Get the start date of the most recent session
    SELECT start_date INTO last_session_date
    FROM public.sessions
    ORDER BY start_date DESC
    LIMIT 1;

    -- 2. Check if a new session is needed (every 6 days)
    IF last_session_date IS NULL OR last_session_date < (NOW() - INTERVAL '6 days') THEN
        
        -- A. CROP OPTION (Cleanup)
        -- Deletes predictions older than 6 days to keep the database lean
        DELETE FROM public.crypto_predictions
        WHERE created_at < (NOW() - INTERVAL '6 days');
        
        -- Add other tables to crop here if necessary:
        -- DELETE FROM public.stock_predictions WHERE created_at < (NOW() - INTERVAL '6 days');

        -- B. ADD NEW SESSION ROW
        -- Only one row is added every 6 days
        INSERT INTO public.sessions (
            start_date, 
            end_date, 
            status,
            created_at
        )
        VALUES (
            NOW(), 
            NOW() + INTERVAL '6 days', 
            'active',
            NOW()
        );

        RAISE NOTICE 'Success: New 6-day session started and data cropped.';
    ELSE
        RAISE NOTICE 'Skipping: Current session is still valid (less than 6 days old).';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- HOW TO USE:
-- 1. Run this script in your Supabase SQL Editor.
-- 2. To trigger it manually: SELECT public.manage_6day_cycle();
-- 3. To automate (requires pg_cron):
--    SELECT cron.schedule('manage-cycle-job', '0 0 * * *', 'SELECT public.manage_6day_cycle()');
