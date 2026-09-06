import { supabase } from "@/lib/supabase";

export interface CryptoCoinRecord {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    market_cap_rank: number;
    high_24h: number;
    low_24h: number;
    volume: number;
    image: string;
    updated_at: string;
}

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const TOP_CRYPTO_IDS = [
    'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'dogecoin', 'cardano',
    'avalanche-2', 'tron', 'polkadot', 'chainlink', 'matic-network', 'toncoin', 'shiba-inu',
    'litecoin', 'uniswap', 'near', 'injective-protocol', 'render-token', 'stacks'
];

let cachedCrypto: { data: CryptoCoinRecord[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000;

export async function fetchRealCryptoData(): Promise<CryptoCoinRecord[]> {
    if (cachedCrypto && (Date.now() - cachedCrypto.timestamp) < CACHE_TTL_MS) {
        return cachedCrypto.data;
    }

    try {
        const ids = TOP_CRYPTO_IDS.join(',');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const list: any[] = await res.json();
            if (Array.isArray(list) && list.length > 0) {
                const records: CryptoCoinRecord[] = list.map((coin, idx) => ({
                    id: coin.id,
                    symbol: `${coin.symbol.toUpperCase()}USDT`,
                    name: coin.name,
                    current_price: Number((coin.current_price || 0).toFixed(2)),
                    price_change_percentage_24h: Number((coin.price_change_percentage_24h || 0).toFixed(2)),
                    market_cap: Number(coin.market_cap || 0),
                    market_cap_rank: Number(coin.market_cap_rank || idx + 1),
                    high_24h: Number((coin.high_24h || coin.current_price || 0).toFixed(2)),
                    low_24h: Number((coin.low_24h || coin.current_price || 0).toFixed(2)),
                    volume: Number(coin.total_volume || 0),
                    image: coin.image || `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
                    updated_at: new Date().toISOString()
                }));

                cachedCrypto = { data: records, timestamp: Date.now() };

                // Upsert into Supabase
                await supabase.from('crypto_coins').upsert(
                    records.map(c => ({
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
                        updated_at: c.updated_at
                    })),
                    { onConflict: 'id' }
                );

                return records;
            }
        }
    } catch (err: any) {
        console.warn('[CryptoData] CoinGecko fetch failed:', err.message);
    }

    return cachedCrypto?.data || [];
}

