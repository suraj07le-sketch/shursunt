"use client";

import { useState, useEffect } from "react";
import { useMarketData, useSyncMarketData, useWatchlist } from "@/hooks/useQueries";
import { Coin, WatchlistItem } from "@/types";
import MarketGrid from "./MarketGrid";
import { Search } from "./Search";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { LocalStorage } from "@/lib/storage";
import ErrorState from "@/components/ui/ErrorState";
import { Layers, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

interface MarketPlaceViewProps {
    initialStocks: Coin[];
    initialCrypto: Coin[];
}

type FilterType = 'all' | 'watchlist' | 'top50' | 'gainers' | 'losers';

export default function MarketPlaceView({ initialStocks, initialCrypto }: MarketPlaceViewProps) {
    const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock');
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useAuth();
    const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

    // React Query handles global market data and background sync
    const { data: stockData } = useMarketData('stock', initialStocks);
    const { data: cryptoData } = useMarketData('crypto', initialCrypto);
    useSyncMarketData();

    const currentData = assetType === 'stock' ? (stockData || initialStocks) : (cryptoData || initialCrypto);

    // Load watchlist IDs from DB via useWatchlist hook
    const { data: watchlistItems = [] } = useWatchlist();

    useEffect(() => {
        if (watchlistItems.length > 0) {
            setWatchlistIds(new Set(watchlistItems.map((item: WatchlistItem) => item.coin_id)));
        } else if (user) {
            const list = LocalStorage.getWatchlist(user.id);
            setWatchlistIds(new Set(list.map((item: WatchlistItem) => item.coin_id)));
        }
    }, [watchlistItems, user]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset page when filter changes
    const filteredData = (currentData || []).filter((coin: Coin) => {
        const matchesSearch =
            coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

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

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const paginatedCoins = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const filterButtons: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All Assets' },
        { id: 'watchlist', label: 'Watchlist' },
        { id: 'top50', label: 'Top 50' },
        { id: 'gainers', label: 'Gainers' },
        { id: 'losers', label: 'Losers' },
    ];

    return (
        <div className="space-y-5 pb-8">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
                            Multi-Asset Screener
                        </h1>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-semibold uppercase">
                            {filteredData.length} ASSETS
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        Real-time order book liquidity across NSE/BSE and Global Crypto pairs
                    </p>
                </div>

                {/* Segmented Asset Switcher */}
                <div className="inline-flex p-1 rounded-lg bg-card border border-border font-mono text-xs">
                    <button
                        onClick={() => { setAssetType('stock'); setCurrentPage(1); }}
                        className={cn(
                            "px-4 py-1.5 rounded-md font-semibold transition-all cursor-pointer",
                            assetType === 'stock'
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        EQUITIES (NSE/BSE)
                    </button>
                    <button
                        onClick={() => { setAssetType('crypto'); setCurrentPage(1); }}
                        className={cn(
                            "px-4 py-1.5 rounded-md font-semibold transition-all cursor-pointer",
                            assetType === 'crypto'
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        CRYPTO (GLOBAL)
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card/60 p-3 rounded-xl border border-border">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono text-xs no-scrollbar">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mr-1 shrink-0" />
                    {filterButtons.map((fb) => (
                        <button
                            key={fb.id}
                            onClick={() => { setFilter(fb.id); setCurrentPage(1); }}
                            className={cn(
                                "px-3 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer border text-xs font-semibold",
                                filter === fb.id
                                    ? "bg-primary/15 border-primary/40 text-primary"
                                    : "bg-muted/20 border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                        >
                            {fb.label}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="w-full md:w-80">
                    <Search
                        value={searchQuery}
                        onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                        placeholder={`Search ${assetType === 'stock' ? 'equities...' : 'crypto pairs...'}`}
                    />
                </div>
            </div>

            {/* Grid / List Content */}
            {filteredData.length > 0 ? (
                <MarketGrid
                    coins={paginatedCoins}
                    assetType={assetType}
                    watchlistIds={watchlistIds}
                    source={filter === 'watchlist' ? 'watchlist' : 'market'}
                    onWatchlistChange={() => {
                        if (user) {
                            const list = LocalStorage.getWatchlist(user.id);
                            setWatchlistIds(new Set(list.map(item => item.coin_id)));
                        }
                    }}
                />
            ) : (
                <div className="py-12 bg-card/40 border border-border rounded-xl">
                    <ErrorState
                        type={searchQuery ? 'search' : filter === 'watchlist' ? 'empty' : 'error'}
                        title={
                            searchQuery ? "No matches found" :
                                filter === 'watchlist' ? "Watchlist is empty" :
                                    "No market data available"
                        }
                        message={
                            searchQuery ? `No ${assetType} matched "${searchQuery}"` :
                                filter === 'watchlist' ? "Pin assets using the bookmark icon to monitor them here." :
                                    "Unable to load active market quotes. Verify API connection."
                        }
                    />
                </div>
            )}

            {/* Pagination Controls */}
            {filteredData.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border font-mono text-xs">
                    <div className="text-muted-foreground">
                        Showing <span className="text-foreground font-semibold tabular-nums">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="text-foreground font-semibold tabular-nums">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-foreground font-semibold tabular-nums">{filteredData.length}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>PREV</span>
                        </button>
                        <span className="px-2 font-semibold text-foreground tabular-nums">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"
                        >
                            <span>NEXT</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

