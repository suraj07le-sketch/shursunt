import { supabase } from "./supabase";
import { unstable_cache } from "next/cache";

// Wrapped in unstable_cache to prevent DB blasting
export const getMarketData = unstable_cache(
    async (assetType: 'stock' | 'crypto' = 'stock') => {
        try {
            const tableName = assetType === 'stock' ? 'indian_stocks' : 'crypto_coins';

            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order(assetType === 'stock' ? 'market_cap' : 'rank', { ascending: assetType === 'crypto' });

            if (error) {
                console.error(`Supabase ${assetType} Error:`, JSON.stringify(error, null, 2));
                return [];
            }

            return (data || []).map((item: any, index: number) => ({
                id: item.id,
                symbol: item.symbol,
                name: item.name,
                image: item.image || null,
                current_price: assetType === 'stock' ? item.current_price : (item.price_usd || item.current_price), // Handle schema variance
                price_change_percentage_24h: assetType === 'stock' ? item.price_change_percentage_24h : (item.change_24h || item.price_change_percentage_24h),
                high_24h: item.high_24h,
                low_24h: item.low_24h,
                market_cap: assetType === 'stock' ? item.market_cap : (item.market_cap_usd || item.market_cap || 0),
                market_cap_rank: item.market_cap_rank || item.rank || (index + 1),
                volume: item.volume,
                asset_type: assetType
            }));

        } catch (error) {
            console.error("Market Data Error:", error);
            return [];
        }
    },
    ['market-data-v2'],
    { revalidate: 30, tags: ['market-data-v2'] }
);

export async function getCoinDetails(id: string) {
    const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
        { next: { revalidate: 60 } }
    );

    if (!res.ok) {
        // Fallback or error
        return null;
    }
    return res.json();
}
