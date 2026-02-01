import { getMarketData } from "@/lib/api";
import MarketDashboard from "@/components/dashboard/MarketDashboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CryptoPage() {
    const coins = await getMarketData('crypto');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Crypto Market
            </h1>

            <MarketDashboard coins={coins} assetType="crypto" />
        </div>
    );
}
