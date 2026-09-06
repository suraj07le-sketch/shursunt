import { getMarketData } from "@/lib/api";
import MarketDashboard from "@/components/dashboard/MarketDashboard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CryptoPage() {
    const coins = await getMarketData('crypto');

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
                        Digital Asset Terminal
                    </h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-semibold">
                        GLOBAL SPOT
                    </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Live charts, Binance order books, and real-time liquidity across 1000+ crypto pairs
                </p>
            </div>

            <MarketDashboard coins={coins} assetType="crypto" />
        </div>
    );
}
