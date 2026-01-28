import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Service Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
    console.log('--- Diagnosing Database Access (Service Role) ---');

    // 1. Check if 'profiles' table exists
    const { data: profiles, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error("Error accessing 'profiles':", selectError);
    } else {
        console.log("Success accessing 'profiles'. Existing rows:", profiles?.length);
    }

    // 2. Try to insert a dummy profile (mimic trigger)
    // Assuming Trigger uses (id, email, username)
    // We'll try to insert with a random ID to see if it accepts it.
    // If this works, the table is fine, and the Auth Trigger Logic is the issue.
    const testId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID

    // We check if we can insert. Note: constraints might fail, but that gives us info.
    const { error: insertError } = await supabase
        .from('profiles')
        .insert({
            id: testId,
            email: 'test_diag@example.com',
            username: 'test_diag'
        });

    if (insertError) {
        console.error("Insert to 'profiles' failed:", insertError);
    } else {
        console.log("Insert to 'profiles' SUCCESS. (Cleaning up...)");
        await supabase.from('profiles').delete().eq('id', testId);
    }
}

diagnose();
