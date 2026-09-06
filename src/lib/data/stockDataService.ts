import YahooFinance from 'yahoo-finance2';
import { supabase } from '@/lib/supabase';

// Initialize YahooFinance instance
const yahoo = new YahooFinance();

export interface MarketIndexRecord {
    symbol: string;
    name: string;
    current_value: number;
    change_points: number;
    change_percent: number;
    high_24h?: number;
    low_24h?: number;
    source: string;
    updated_at: string;
}

export interface StockQuoteRecord {
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    high_24h: number;
    low_24h: number;
    volume: number;
    image?: string;
    updated_at: string;
}

const TRACKED_INDICES = [
    { symbol: '^NSEI', name: 'NIFTY 50' },
    { symbol: '^BSESN', name: 'BSE SENSEX' },
    { symbol: '^INDIAVIX', name: 'INDIA VIX' },
    { symbol: '^NSEBANK', name: 'NIFTY BANK' },
    { symbol: '^CNXIT', name: 'NIFTY IT' }
];

const CORE_NSE_STOCKS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'BHARTIARTL.NS', 'SBIN.NS', 'LICI.NS', 'ITC.NS', 'HINDUNILVR.NS',
    'LT.NS', 'BAJFINANCE.NS', 'SUNPHARMA.NS', 'MARUTI.NS', 'TATAMOTORS.NS',
    'NTPC.NS', 'ONGC.NS', 'ADANIENT.NS', 'TITAN.NS', 'AXISBANK.NS'
];

let cachedIndices: { data: MarketIndexRecord[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache shield

/**
 * Fetch Market Indices (Nifty 50, Sensex, India VIX)
 */
export async function fetchMarketIndices(): Promise<MarketIndexRecord[]> {
    if (cachedIndices && (Date.now() - cachedIndices.timestamp) < CACHE_TTL_MS) {
        return cachedIndices.data;
    }

    try {
        const results: MarketIndexRecord[] = [];

        for (const idx of TRACKED_INDICES) {
            try {
                const quote: any = await yahoo.quote(idx.symbol);
                if (quote && quote.regularMarketPrice != null) {
                    results.push({
                        symbol: idx.symbol,
                        name: idx.name,
                        current_value: Number(quote.regularMarketPrice.toFixed(2)),
                        change_points: Number((quote.regularMarketChange || 0).toFixed(2)),
                        change_percent: Number((quote.regularMarketChangePercent || 0).toFixed(2)),
                        high_24h: quote.regularMarketDayHigh ? Number(quote.regularMarketDayHigh.toFixed(2)) : undefined,
                        low_24h: quote.regularMarketDayLow ? Number(quote.regularMarketDayLow.toFixed(2)) : undefined,
                        source: 'nse-public-yahoo',
                        updated_at: new Date().toISOString()
                    });
                }
            } catch (err: any) {
                console.warn(`[StockData] Yahoo quote failed for ${idx.symbol}:`, err.message);
            }
        }

        if (results.length > 0) {
            cachedIndices = { data: results, timestamp: Date.now() };

            // Upsert to Supabase
            await supabase.from('market_indices').upsert(
                results.map(r => ({
                    symbol: r.symbol,
                    name: r.name,
                    current_value: r.current_value,
                    change_points: r.change_points,
                    change_percent: r.change_percent,
                    high_24h: r.high_24h,
                    low_24h: r.low_24h,
                    source: r.source,
                    updated_at: r.updated_at
                })),
                { onConflict: 'symbol' }
            );

            return results;
        }
    } catch (e: any) {
        console.error('[StockData] Failed to fetch indices:', e.message);
    }

    // Fallback baseline if network is blocked
    return [
        { symbol: '^NSEI', name: 'NIFTY 50', current_value: 25145.30, change_points: 124.50, change_percent: 0.50, source: 'cached-baseline', updated_at: new Date().toISOString() },
        { symbol: '^BSESN', name: 'BSE SENSEX', current_value: 82365.70, change_points: 380.20, change_percent: 0.46, source: 'cached-baseline', updated_at: new Date().toISOString() },
        { symbol: '^INDIAVIX', name: 'INDIA VIX', current_value: 13.85, change_points: -0.45, change_percent: -3.15, source: 'cached-baseline', updated_at: new Date().toISOString() }
    ];
}

/**
 * Fetch Real Indian Stock Quotes
 */
export async function fetchRealStockQuotes(): Promise<StockQuoteRecord[]> {
    try {
        const quotes: any[] = await yahoo.quote(CORE_NSE_STOCKS);
        if (!Array.isArray(quotes)) return [];

        const records: StockQuoteRecord[] = quotes.map((q) => {
            const sym = q.symbol.replace('.NS', '');
            return {
                symbol: sym,
                name: q.longName || q.shortName || sym,
                current_price: Number((q.regularMarketPrice || 0).toFixed(2)),
                price_change_percentage_24h: Number((q.regularMarketChangePercent || 0).toFixed(2)),
                market_cap: Number(q.marketCap || 0),
                high_24h: Number((q.regularMarketDayHigh || q.regularMarketPrice || 0).toFixed(2)),
                low_24h: Number((q.regularMarketDayLow || q.regularMarketPrice || 0).toFixed(2)),
                volume: Number(q.regularMarketVolume || 0),
                image: `https://logo.clearbit.com/${sym.toLowerCase()}.com`,
                updated_at: new Date().toISOString()
            };
        });

        if (records.length > 0) {
            await supabase.from('indian_stocks').upsert(
                records.map(r => ({
                    symbol: r.symbol,
                    name: r.name,
                    current_price: r.current_price,
                    price_change_percentage_24h: r.price_change_percentage_24h,
                    market_cap: r.market_cap,
                    high_24h: r.high_24h,
                    low_24h: r.low_24h,
                    volume: r.volume,
                    image: r.image,
                    updated_at: r.updated_at
                })),
                { onConflict: 'symbol' }
            );
        }

        return records;
    } catch (err: any) {
        console.error('[StockData] Yahoo stock quotes exception:', err.message);
        return [];
    }
}

