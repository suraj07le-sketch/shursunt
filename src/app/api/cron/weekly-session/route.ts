import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 1. Verify Vercel Cron Secret (Security)
        const authHeader = req.headers.get('authorization');
        const expectedSecret = process.env.CRON_SECRET;

        // If CRON_SECRET is configured, enforce it. Otherwise, allow execution (for local testing).
        if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ error: 'Unauthorized. Invalid Cron Secret.' }, { status: 401 });
        }

        // 2. Initialize Supabase Admin Client
        // We use the SERVICE_ROLE_KEY to bypass RLS since this is a background job
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
        }

        // Initialize a standard client with the service role key
        // Using @supabase/supabase-js directly here is easier for background jobs than SSR cookies
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Setup dates for the new session (1 week duration)
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        // 4. Mark previous 'active' sessions as 'completed'
        await supabase
            .from('sessions')
            .update({ status: 'completed' })
            .eq('status', 'active');

        // 5. Insert new session
        const { data, error } = await supabase
            .from('sessions')
            .insert({
                start_date: now.toISOString(),
                end_date: nextWeek.toISOString(),
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('[CRON] Failed to create session:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('[CRON] Successfully created new weekly session:', data.id);

        return NextResponse.json({
            success: true,
            message: 'Weekly session created successfully',
            session: data
        });

    } catch (error: any) {
        console.error('[CRON] Error executing weekly session task:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
