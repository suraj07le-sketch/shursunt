
import { createClient } from '@supabase/supabase-js';

// Load env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase credentials. Make sure .env.local is loaded.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("🔍 Debugging Prediction Data in Supabase...\n");

    // 1. Check Stock Predictions
    console.log("📊 Fetching last 5 Stock Predictions...");
    const { data: stockData, error: stockError } = await supabase
        .from('stock_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (stockError) {
        console.error("❌ Error fetching stocks:", stockError.message);
    } else if (!stockData || stockData.length === 0) {
        console.log("⚠️ No stock predictions found.");
    } else {
        console.log("Found columns:", Object.keys(stockData[0]));
        stockData.forEach(p => {
            console.log(`   - [${new Date(p.created_at).toLocaleString()}] ${p.stock_name}: ${p.trend} (Price: ${p.predicted_price})`);
        });
    }

    console.log("\n--------------------------------------------------\n");

    // 2. Check Crypto Predictions
    console.log("🪙 Fetching last 5 Crypto Predictions...");
    const { data: cryptoData, error: cryptoError } = await supabase
        .from('crypto_predictions')
        .select('id, user_id, coin, created_at, predicted_price, trend')
        .order('created_at', { ascending: false })
        .limit(5);

    if (cryptoError) {
        console.error("❌ Error fetching crypto:", cryptoError.message);
    } else if (!cryptoData || cryptoData.length === 0) {
        console.log("⚠️ No crypto predictions found.");
    } else {
        cryptoData.forEach(p => {
            console.log(`   - [${new Date(p.created_at).toLocaleString()}] ${p.coin}: ${p.trend} (ID: ${p.id})`);
        });
    }

    console.log("\n--------------------------------------------------\n");
    console.log("✅ Diagnostic complete.");
}

main();
