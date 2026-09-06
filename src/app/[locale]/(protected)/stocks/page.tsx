import { getMarketData } from "@/lib/api";
import MarketDashboard from "@/components/dashboard/MarketDashboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StocksPage() {
    const coins = await getMarketData('stock');

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
                        Indian Equities Terminal
                    </h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-semibold">
                        NSE / BSE
                    </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Live charts, order book liquidity, and technical indicators across 500+ Indian stocks
                </p>
            </div>

            <MarketDashboard coins={coins} assetType="stock" />
        </div>
    );
}
