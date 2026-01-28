import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectRows() {
    console.log('--- Latest Stock Prediction ---');
    const { data: stock } = await supabase.from('stock_predictions').select('*').order('created_at', { ascending: false }).limit(1);
    if (stock && stock.length) {
        console.log('Stock Columns:', Object.keys(stock[0]));
    } else {
        console.log('No stock predictions found via standard query.');
        // Try without ordering by created_at in case it's null?
        const { data: stockAny } = await supabase.from('stock_predictions').select('*').limit(1);
        console.log('Random Stock Row:', stockAny?.[0]);
    }
}

inspectRows();
