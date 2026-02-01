import { getMarketData } from "@/lib/api";
import MarketPlaceView from "@/components/dashboard/MarketPlaceView";

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;
export const revalidate = 60; // Align with api.ts cache

export default async function MarketPage() {
    // Parallel data fetching for performance
    const [stocks, crypto] = await Promise.all([
        getMarketData('stock'),
        getMarketData('crypto')
    ]);

    return (
        <MarketPlaceView
            initialStocks={stocks}
            initialCrypto={crypto}
        />
    );
}
