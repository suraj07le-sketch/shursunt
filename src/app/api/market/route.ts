
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';

// Cache the database query to be super fast
const getMarketData = unstable_cache(
    async (type: 'stock' | 'crypto') => {
        const table = type === 'stock' ? 'indian_stocks' : 'crypto_coins';
        // Select logic handling legacy columns if needed
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order(type === 'stock' ? 'market_cap' : 'rank', { ascending: type === 'crypto', nullsFirst: false });

        if (error) throw error;
        return data || [];
    },
    ['market-data-db'],
    { revalidate: 30, tags: ['market-data'] }
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') === 'crypto' ? 'crypto' : 'stock';

        const data = await getMarketData(type);

        // Normalize data structure for frontend
        const normalized = data.map((item: any, index: number) => ({
            id: item.id,
            symbol: item.symbol,
            name: item.name,
            image: item.image || null,
            current_price: type === 'stock' ? item.current_price : (item.price_usd || item.current_price),
            price_change_percentage_24h: type === 'stock' ? item.price_change_percentage_24h : (item.change_24h || item.price_change_percentage_24h),
            high_24h: item.high_24h,
            low_24h: item.low_24h,
            market_cap: type === 'stock' ? item.market_cap : (item.market_cap_usd || item.market_cap || 0),
            market_cap_rank: item.market_cap_rank || item.rank || (index + 1),
            volume: item.volume,
            asset_type: type
        }));

        return NextResponse.json({
            success: true,
            data: normalized
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
