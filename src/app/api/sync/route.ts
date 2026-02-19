
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// --- Configuration ---
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Stocks to Track (NSE Tickers)
const STOCK_SYMBOLS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'LICI.NS',
    'ADANIENT.NS', 'TATAMOTORS.NS', 'SUNPHARMA.NS', 'MARUTI.NS', 'ONGC.NS'
];

// Crypto IDs (CoinGecko)
const CRYPTO_IDS = [
    'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'dogecoin', 'cardano',
    'avalanche-2', 'tron', 'polkadot', 'chainlink', 'matic-network', 'toncoin', 'shiba-inu',
    'litecoin', 'dai', 'bitcoin-cash', 'uniswap', 'leo-token', 'wrapped-bitcoin', 'okb',
    'ethereum-classic', 'monero', 'stellar', 'kaspa', 'cosmos', 'lido-dao', 'internet-computer',
    'aptos', 'filecoin', 'near', 'arbitrum', 'optimism', 'vechain', 'injective-protocol',
    'hedera-hashgraph', 'fantom', 'the-graph', 'render-token', 'stacks', 'aave', 'thorchain',
    'multiversx-egold', 'immutable-x', 'algorand', 'quant-network', 'flow',
    'eos', 'tezos', 'bitget-token', 'gala'
];

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const isDev = process.env.NODE_ENV === 'development';

        if (!isDev && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        console.log("[Sync] Starting Data Sync...");

        const cryptoData = await fetchCryptos();
        const stockData = await fetchStocks();

        // Background update
        (async () => {
            try {
                await updateDatabase(stockData, cryptoData);
                console.log(`[Sync] Background database update completed.`);
            } catch (dbError) {
                console.error("[Sync] Background database update failed:", dbError);
            }
        })();

        return NextResponse.json({
            success: true,
            data: {
                stocks: stockData,
                cryptos: cryptoData
            }
        });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// --- Helpers ---

async function fetchCryptos() {
    try {
        const ids = CRYPTO_IDS.join(',');
        const res = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`, {
            cache: 'no-store'
        });
        const data = await res.json() as any[];

        if (!Array.isArray(data)) return [];

        const SYMBOL_MAP: Record<string, string> = {
            'bitcoin': 'BTCUSDT', 'ethereum': 'ETHUSDT', 'solana': 'SOLUSDT', 'binancecoin': 'BNBUSDT',
            'ripple': 'XRPUSDT', 'dogecoin': 'DOGEUSDT', 'cardano': 'ADAUSDT', 'avalanche-2': 'AVAXUSDT',
            'tron': 'TRXUSDT', 'polkadot': 'DOTUSDT', 'chainlink': 'LINKUSDT', 'matic-network': 'MATICUSDT',
            'toncoin': 'TONUSDT', 'shiba-inu': 'SHIBUSDT', 'litecoin': 'LTCUSDT', 'dai': 'DAIUSDT',
            'bitcoin-cash': 'BCHUSDT', 'uniswap': 'UNIUSDT', 'leo-token': 'LEOUSDT', 'wrapped-bitcoin': 'WBTCUSDT',
            'okb': 'OKBUSDT', 'ethereum-classic': 'ETCUSDT', 'monero': 'XMRUSDT', 'stellar': 'XLMUSDT',
            'kaspa': 'KASUSDT', 'cosmos': 'ATOMUSDT', 'lido-dao': 'LDOUSDT', 'internet-computer': 'ICPUSDT',
            'aptos': 'APTUSDT', 'filecoin': 'FILUSDT', 'near': 'NEARUSDT', 'arbitrum': 'ARBUSDT',
            'optimism': 'OPUSDT', 'vechain': 'VETUSDT', 'injective-protocol': 'INJUSDT', 'hedera-hashgraph': 'HBARUSDT',
            'fantom': 'FTMUSDT', 'the-graph': 'GRTUSDT', 'render-token': 'RNDRUSDT', 'stacks': 'STXUSDT',
            'aave': 'AAVEUSDT', 'thorchain': 'RUNEUSDT', 'multiversx-egold': 'EGLDUSDT', 'immutable-x': 'IMXUSDT',
            'algorand': 'ALGOUSDT', 'quant-network': 'QNTUSDT', 'flow': 'FLOWUSDT', 'eos': 'EOSUSDT',
            'tezos': 'XTZUSDT', 'bitget-token': 'BGBUSDT', 'gala': 'GALAUSDT'
        };

        return data.map(coin => ({
            id: coin.id,
            symbol: SYMBOL_MAP[coin.id] || coin.symbol.toUpperCase(),
            name: coin.name,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            market_cap_rank: coin.market_cap_rank,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            image: coin.image || `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
            high_24h: coin.high_24h,
            low_24h: coin.low_24h,
            volume: coin.total_volume
        }));
    } catch (e) {
        console.error("CoinGecko Error:", e);
        return [];
    }
}

async function fetchStocks() {
    const INDIAN_API_KEY = process.env.INDIAN_API_KEY;

    if (INDIAN_API_KEY) {
        try {
            console.log("[Sync] Pulling data from Indian Stock API...");
            const valid: any[] = [];

            for (const fullSymbol of STOCK_SYMBOLS) {
                const sym = fullSymbol.split('.')[0];
                try {
                    const res = await fetch(`https://stock.indianapi.in/stock?name=${sym}`, {
                        headers: { "X-Api-Key": INDIAN_API_KEY },
                        next: { revalidate: 300 }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        valid.push({
                            symbol: sym,
                            name: data.companyName || sym,
                            current_price: data.currentPrice?.NSE || data.currentPrice?.BSE || 0,
                            price_change_percentage_24h: data.changePercentage || 0,
                            market_cap: data.marketCap || 0,
                            high_24h: data.high52Week || 0,
                            low_24h: data.low52Week || 0,
                            volume: data.volume || 0,
                            image: `https://logo.clearbit.com/${sym.toLowerCase()}.com`
                        });
                        await new Promise(r => setTimeout(r, 1000));
                    }
                } catch (e) {
                    console.error(`[Sync] Individual fetch failed for ${sym}`);
                }
            }

            if (valid.length >= 5) return valid;
        } catch (e) {
            console.error("[Sync] Indian API critical failure");
        }
    }

    // Fallback
    const symbolsParam = STOCK_SYMBOLS.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsParam}`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        const results = json.quoteResponse?.result || [];

        return results.map((quote: any) => ({
            symbol: quote.symbol.replace('.NS', ''),
            name: quote.longName || quote.shortName,
            current_price: quote.regularMarketPrice,
            price_change_percentage_24h: quote.regularMarketChangePercent,
            market_cap: quote.marketCap,
            high_24h: quote.regularMarketDayHigh,
            low_24h: quote.regularMarketDayLow,
            volume: quote.regularMarketVolume,
            image: `https://logo.clearbit.com/${quote.symbol.replace('.NS', '').toLowerCase()}.com`
        }));
    } catch (e) {
        return [];
    }
}

async function updateDatabase(stocks: any[], cryptos: any[]) {
    if (stocks.length > 0) {
        await supabase.from('indian_stocks').upsert(
            stocks.map(s => ({
                symbol: s.symbol,
                name: s.name,
                current_price: s.current_price,
                price_change_percentage_24h: s.price_change_percentage_24h,
                market_cap: s.market_cap,
                high_24h: s.high_24h,
                low_24h: s.low_24h,
                volume: s.volume,
                updated_at: new Date().toISOString()
            })),
            { onConflict: 'symbol' }
        );
    }

    if (cryptos.length > 0) {
        await supabase.from('crypto_coins').upsert(
            cryptos.map(c => ({
                id: c.id,
                symbol: c.symbol,
                name: c.name,
                image: c.image,
                current_price: c.current_price,
                price_usd: c.current_price,
                price_change_percentage_24h: c.price_change_percentage_24h,
                change_24h: c.price_change_percentage_24h,
                market_cap: c.market_cap,
                market_cap_usd: c.market_cap,
                market_cap_rank: c.market_cap_rank,
                rank: c.market_cap_rank,
                high_24h: c.high_24h,
                low_24h: c.low_24h,
                volume: c.volume,
                volume_24h: c.volume,
                updated_at: new Date().toISOString()
            })),
            { onConflict: 'id' }
        );
    }
}
