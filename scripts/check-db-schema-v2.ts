import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking All Tables ---');
    // Using a known hack to list tables if information_schema is restricted
    // But first try the standard way
    const { data: tables, error } = await supabase
        .from('information_schema.tables') // This often fails with RLS/Anon key
        .select('*');

    if (error || !tables || tables.length === 0) {
        console.log('Direct listing failed or empty. Checking common table names...');
        const tablesToCheck = ['users', 'profiles', 'roles', 'user_roles', 'app_users'];
        for (const t of tablesToCheck) {
            const { error: e } = await supabase.from(t).select('*').limit(1);
            if (!e) console.log(`[FOUND] ${t}`);
            else console.log(`[MISSING/RESTRICTED] ${t} (${e.code})`);
        }
    } else {
        console.log('Tables found via information_schema:', tables);
    }
}

checkSchema();
