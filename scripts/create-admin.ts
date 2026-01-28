import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'sonkarsuraj447@gmail.com';
    const password = 'Gj27an0057@@'; // Note: In production, pass this via env or args
    const username = 'suraj';

    console.log(`Creating/Updating Admin User: ${email}...`);

    // 1. Check if user exists
    // The admin.listUsers filtering is limited, so we iterate or try create first.
    // Actually, createPageUser / createUser with email handling is safer.

    // Try to invite/create or update.
    // We'll try to retrieve by email first if possible via listUsers (costly if many users but fine for seeding)
    // Or just "createUser" and catch error if exists.

    // Best approach: supabase.auth.admin.createUser
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            role: 'admin',
            username,
            full_name: 'Suraj Sonkar',
            avatar_url: ''
        }
    });

    if (createError) {
        // likely already exists
        console.log('User might already exist. Updating details...');

        // Need to find ID to update.
        // We can search by email? 
        // Supabase Admin API: listUsers({ page: 1, perPage: 1000 }) -> filter JS side
        // There isn't a direct "getUserByEmail" in admin api publicly exposed always, but let's check.
        // Actually, we can just use `listUsers` and filter.

        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('Failed to list users:', listError);
            return;
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                {
                    password: password, // Reset password to ensure access
                    user_metadata: { ...existingUser.user_metadata, role: 'admin', username }
                }
            );

            if (updateError) {
                console.error('Failed to update existing user:', updateError);
            } else {
                console.log('Successfully updated existing user to Admin.');
                console.log('User ID:', updated.user.id);
            }
        } else {
            console.error('Could not create user and could not find it in list. Error:', createError);
        }

    } else {
        console.log('Admin user created successfully!');
        console.log('User ID:', createdUser.user.id);
    }
}

createAdmin().catch(console.error);
