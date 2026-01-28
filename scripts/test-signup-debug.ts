import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
    const randomEmail = `test_${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    console.log(`Attempting create: ${randomEmail}`);

    // Try 1: Clean signup
    const { data: d1, error: e1 } = await supabase.auth.signUp({
        email: randomEmail,
        password,
    });

    if (e1) {
        console.error('Test 1 (No Metadata) Failed:', e1.message);
    } else {
        console.log('Test 1 (No Metadata) Success! ID:', d1.user?.id);
    }
}

testSignup();
