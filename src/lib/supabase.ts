
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing! Check .env.local");
}

// Singleton pattern to prevent multiple instances during HMR
const globalForSupabase = globalThis as unknown as {
    supabase: any;
};

export const supabase = globalForSupabase.supabase ?? createBrowserClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
    globalForSupabase.supabase = supabase;
}
