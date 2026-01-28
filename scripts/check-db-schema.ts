import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Stock Predictions ---');
    const { data: stockData, error: stockError } = await supabase.from('stock_predictions').select('*').limit(1);
    if (stockError) console.error(stockError);
    else if (stockData && stockData.length > 0) console.log(Object.keys(stockData[0]));
    else console.log('No data found');

    console.log('\n--- Crypto Predictions ---');
    const { data: cryptoData, error: cryptoError } = await supabase.from('crypto_predictions').select('*').limit(1);
    if (cryptoError) console.error(cryptoError);
    else if (cryptoData && cryptoData.length > 0) console.log(Object.keys(cryptoData[0]));
    else console.log('No data found');
}

checkSchema();
