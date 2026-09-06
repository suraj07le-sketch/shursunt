"use client";

import { useState, useRef, useEffect } from "react";
import { useMarketData, useWatchlist } from "@/hooks/useQueries";
import { Coin, WatchlistItem } from "@/types";
import TradingViewWidget from "@/components/dashboard/TradingViewWidget";
import MarketTable from "@/components/dashboard/MarketTable";
import { useAuth } from "@/context/AuthContext";
import { LocalStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

interface MarketDashboardProps {
    coins: Coin[];
    assetType?: 'stock' | 'crypto';
}

export default function MarketDashboard({ coins, assetType = 'stock' }: MarketDashboardProps) {
    const [selectedSymbol, setSelectedSymbol] = useState(
        assetType === 'stock' ? "BSE:RELIANCE" : "BINANCE:BTCUSDT"
    );
    const topRef = useRef<HTMLDivElement>(null);

    // React Query version of market data
    const { data: liveCoins } = useMarketData(assetType, coins);
    const displayCoins = liveCoins || coins;

    const handleCoinSelect = (symbol: string) => {
        let chartSymbol = symbol.toUpperCase();
        if (assetType === 'stock') {
            chartSymbol = (symbol.includes(":") ? symbol : `BSE:${symbol}`).toUpperCase();
        } else {
            const base = symbol.toUpperCase().endsWith("USDT")
                ? symbol.toUpperCase()
                : `${symbol.toUpperCase()}USDT`;
            chartSymbol = `BINANCE:${base}`;
        }

        setSelectedSymbol(chartSymbol);

        setTimeout(() => {
            topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    // Filter Logic
    const [filter, setFilter] = useState<'all' | 'watchlist' | 'top50' | 'gainers' | 'losers'>('all');
    const { user } = useAuth();
    const { data: watchlistItems = [] } = useWatchlist();
    const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (watchlistItems.length > 0) {
            setWatchlistIds(new Set(watchlistItems.map((item: WatchlistItem) => item.coin_id)));
        } else if (user) {
            const list = LocalStorage.getWatchlist(user.id);
            setWatchlistIds(new Set(list.map((item: WatchlistItem) => item.coin_id)));
        }
    }, [watchlistItems, user]);

    const filteredCoins = displayCoins.filter((coin: Coin) => {
        switch (filter) {
            case 'watchlist':
                return watchlistIds.has(coin.id);
            case 'top50':
                return (coin.market_cap_rank || 999) <= 50;
            case 'gainers':
                return (coin.price_change_percentage_24h ?? 0) > 0;
            case 'losers':
                return (coin.price_change_percentage_24h ?? 0) < 0;
            default:
                return true;
        }
    });

    const filterOptions: { id: typeof filter; label: string }[] = [
        { id: 'all', label: 'All Assets' },
        { id: 'watchlist', label: 'Watchlist' },
        { id: 'top50', label: 'Top 50' },
        { id: 'gainers', label: 'Gainers' },
        { id: 'losers', label: 'Losers' },
    ];

    return (
        <div className="space-y-6" ref={topRef}>
            {/* TradingView Chart Container */}
            <div className="w-full h-[60vh] min-h-[480px] rounded-xl overflow-hidden border border-border bg-card/60 shadow-xl relative">
                <TradingViewWidget
                    symbol={selectedSymbol}
                    className="w-full h-full"
                />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs no-scrollbar">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mr-1 shrink-0" />
                {filterOptions.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={cn(
                            "px-3 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer border font-semibold",
                            filter === f.id
                                ? "bg-primary/15 border-primary/40 text-primary"
                                : "bg-muted/20 border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Market Table */}
            <MarketTable
                coins={filteredCoins}
                onSelect={handleCoinSelect}
                assetType={assetType}
                watchlistIds={watchlistIds}
                onWatchlistChange={() => {
                    if (user) {
                        const list = LocalStorage.getWatchlist(user.id);
                        setWatchlistIds(new Set(list.map(item => item.coin_id)));
                    }
                }}
            />
        </div>
    );
}

