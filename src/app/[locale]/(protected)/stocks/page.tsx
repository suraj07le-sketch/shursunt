import { getMarketData } from "@/lib/api";
import MarketDashboard from "@/components/dashboard/MarketDashboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StocksPage() {
    const coins = await getMarketData('stock');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                Indian Stocks
            </h1>

            <MarketDashboard coins={coins} assetType="stock" />
        </div>
    );
}
