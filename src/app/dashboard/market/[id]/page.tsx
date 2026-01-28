import { supabase } from "@/lib/supabase";
import TradingViewWidget from "@/components/dashboard/TradingViewWidget";
import { getCoinDetails } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CoinPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. Fetch coin details from Supabase by symbol or ID
    // Since our route is /market/[id], we assume 'id' is like 'SOPHUSDT' or the UUID.
    // Let's try to find by ID first, or symbol. 
    // Given the market table uses 'id' which is a UUID, we need to fetch the symbol using that UUID.

    // However, for the TradingView widget we need the SYMBOL (e.g. BTCUSDT).

    let symbol = "BTCUSDT"; // Default
    let coinName = "Bitcoin";

    const { data: coin } = await supabase
        .from('crypto_coins')
        .select('*')
        .eq('id', id)
        .single();

    if (coin) {
        symbol = coin.symbol; // e.g., SOPHUSDT
        coinName = coin.name;
    }

    // NEW: Fetch fresh data from CoinGecko for 24h stats
    // We try to use the name lowercased as the ID for CoinGecko (e.g. "Bitcoin" -> "bitcoin")
    // This is a heuristic; ideally we'd store the CoinGecko ID in the DB.
    let high24h = coin?.high_24h;
    let low24h = coin?.low_24h;

    if (coinName) {
        try {
            const cgId = coinName.toLowerCase();
            const cgData = await getCoinDetails(cgId);
            if (cgData && cgData.market_data) {
                high24h = cgData.market_data.high_24h.usd ?? high24h;
                low24h = cgData.market_data.low_24h.usd ?? low24h;
            }
        } catch (err) {
            console.error("Error fetching CoinGecko details:", err);
        }
    }

    // NEW: Ensure symbol is formatted correctly for TradingView (needs trading pair like BTCUSDT)
    const chartSymbol = (symbol.toUpperCase().endsWith("USDT") ? symbol : `${symbol}USDT`).toUpperCase();

    return (
        <div className="space-y-6">
            <Link
                href="/dashboard/market"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Market
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        {coinName}
                    </h1>
                    <p className="text-xl text-muted-foreground font-mono mt-2">{symbol}</p>
                </div>
                {coin && (
                    <div className="text-right">
                        <div className="text-3xl font-mono mobile-text-2xl">${coin.price_usd?.toLocaleString() ?? "0.00"}</div>
                        <div className={`text-lg font-medium ${(coin.change_24h ?? 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(coin.change_24h ?? 0) > 0 ? '+' : ''}{coin.change_24h?.toFixed(2)}%
                        </div>
                    </div>
                )}
            </div>

            <TradingViewWidget symbol={chartSymbol} />


        </div>
    );
}
