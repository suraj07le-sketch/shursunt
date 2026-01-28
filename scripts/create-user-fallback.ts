import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser() {
    const email = 'sonkarsuraj447@gmail.com';
    const password = 'Gj27an0057@@';
    const username = 'suraj';

    console.log(`Creating User: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                role: 'admin' // Trying to inject admin role via user_metadata
            }
        }
    });

    if (error) {
        console.error('Error creating user:', JSON.stringify(error, null, 2));
    } else {
        console.log('User created successfully!');
        if (data.session) {
            console.log('Session established immediately (Email confirmation might be off).');
        } else {
            console.log('User created. Please check email for confirmation if required.');
        }
        console.log('User ID:', data.user?.id);
    }
}

createUser();
