import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Note: To run this script, use:
// npx tsx --env-file=.env.local scripts/sync-crypto.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Ensure .env.local is present.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCrypto() {
    console.log('🚀 Starting sync of top 1000 crypto coins...');

    // 1. Fetch existing coins to map symbols to IDs
    console.log('🔍 Fetching existing coins from Supabase...');
    const { data: existingCoins, error: fetchError } = await supabase
        .from('crypto_coins')
        .select('id, symbol');

    if (fetchError) {
        console.error('❌ Error fetching existing coins:', fetchError.message);
        process.exit(1);
    }

    const symbolToId = new Map<string, string>();
    existingCoins?.forEach(c => {
        if (c.symbol) symbolToId.set(c.symbol.toUpperCase(), c.id);
    });
    console.log(`✅ Loaded ${symbolToId.size} existing symbols.`);

    // 2. Fetch from CoinGecko
    const allGeckoCoins = [];
    for (let page = 1; page <= 4; page++) {
        console.log(`📦 Fetching page ${page} from CoinGecko...`);
        const url =
            `https://api.coingecko.com/api/v3/coins/markets` +
            `?vs_currency=usd` +
            `&order=market_cap_desc` +
            `&per_page=250` +
            `&page=${page}` +
            `&sparkline=false`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('⚠️ Rate limit hit. Waiting 60 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    page--;
                    continue;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as any[];
            allGeckoCoins.push(...data);
            console.log(`✅ Received ${data.length} coins from page ${page}.`);
        } catch (error) {
            console.error(`❌ Error fetching page ${page}:`, error);
            break;
        }

        if (page < 4) {
            console.log('⏱️ Waiting for rate limit window...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    console.log(`📊 Total coins fetched from Gecko: ${allGeckoCoins.length}. Syncing to DB...`);

    // 3. Prepare records for batch upsert
    const recordsMap = new Map<string, any>();

    allGeckoCoins.forEach(coin => {
        const rawSymbol = coin.symbol.toUpperCase();
        const targetSymbol = rawSymbol.endsWith('USDT') ? rawSymbol : `${rawSymbol}USDT`;
        const existingId = symbolToId.get(targetSymbol) || symbolToId.get(rawSymbol);

        const id = existingId || crypto.randomUUID();

        // Prevent duplicate IDs in the same batch
        if (recordsMap.has(id)) return;

        recordsMap.set(id, {
            id,
            symbol: targetSymbol,
            name: coin.name,
            image: coin.image,
            price_usd: coin.current_price,
            market_cap_usd: coin.market_cap,
            rank: coin.market_cap_rank,
            volume_24h: coin.total_volume,
            change_24h: coin.price_change_percentage_24h,
            high_24h: coin.high_24h || null,
            low_24h: coin.low_24h || null,
            last_updated_ist: new Date().toISOString()
        });
    });

    const records = Array.from(recordsMap.values());

    // 4. Batch Upsert (Processing in chunks of 50)
    const chunkSize = 50;
    let totalSuccess = 0;
    let totalError = 0;

    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        console.log(`📈 Upserting chunk ${i / chunkSize + 1}/${Math.ceil(records.length / chunkSize)} (${chunk.length} items)...`);

        const { error } = await supabase
            .from('crypto_coins')
            .upsert(chunk, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error in chunk ${i / chunkSize + 1}:`, error.message);
            // Fallback to individual for this chunk to isolate errors if necessary
            for (const item of chunk) {
                const { error: indError } = await supabase.from('crypto_coins').upsert(item);
                if (indError) {
                    console.error(`  ❌ Failed item ${item.symbol}:`, indError.message);
                    totalError++;
                } else {
                    totalSuccess++;
                }
            }
        } else {
            totalSuccess += chunk.length;
        }
    }

    console.log(`\n✨ Sync complete!`);
    console.log(`✅ Success: ${totalSuccess}`);
    console.log(`❌ Errors: ${totalError}`);
}

syncCrypto().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
