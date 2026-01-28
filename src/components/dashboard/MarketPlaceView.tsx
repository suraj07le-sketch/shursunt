"use client";

import { useState, useEffect } from "react";
import { Coin, WatchlistItem } from "@/types";
import MarketGrid from "./MarketGrid";
import { Search } from "./Search";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { LocalStorage } from "@/lib/storage";
import ErrorState from "@/components/ui/ErrorState";

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

    // Load watchlist IDs
    useEffect(() => {
        if (!user) return;
        const loadList = () => {
            const list = LocalStorage.getWatchlist(user.id);
            setWatchlistIds(new Set(list.map((item: WatchlistItem) => item.coin_id)));
        };
        loadList();
        window.addEventListener('storage', loadList);
        return () => window.removeEventListener('storage', loadList);
    }, [user]);

    const currentData = assetType === 'stock' ? initialStocks : initialCrypto;

    // Apply filters
    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // 3 cols * 2 rows

    // Reset page when filter changes
    const filteredData = currentData.filter(coin => {
        const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        switch (filter) {
            case 'watchlist':
                return watchlistIds.has(coin.id);
            case 'top50':
                return (coin.market_cap_rank || 999) <= 50;
            case 'gainers':
                return coin.price_change_percentage_24h > 0;
            case 'losers':
                return coin.price_change_percentage_24h < 0;
            default:
                return true;
        }
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedCoins = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-end md:items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 text-white">Market Place</h1>
                    <p className="text-muted-foreground">Discover and track global assets</p>
                </div>

                {/* Stock/Crypto Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => { setAssetType('stock'); setCurrentPage(1); }}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border",
                            assetType === 'stock'
                                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                : "bg-card hover:bg-white/5 border-white/10 text-muted-foreground"
                        )}
                    >
                        Stocks
                    </button>
                    <button
                        onClick={() => { setAssetType('crypto'); setCurrentPage(1); }}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border",
                            assetType === 'crypto'
                                ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_0_15px_rgba(var(--secondary),0.3)]"
                                : "bg-card hover:bg-white/5 border-white/10 text-muted-foreground"
                        )}
                    >
                        Crypto
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar items-center">
                    {/* All Assets Button */}
                    <button
                        onClick={() => { setFilter('all'); setCurrentPage(1); }}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            filter === 'all'
                                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                : "bg-transparent border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        )}
                    >
                        All Assets
                    </button>

                    <button
                        onClick={() => { setFilter('watchlist'); setCurrentPage(1); }}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            filter === 'watchlist'
                                ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_0_15px_rgba(var(--secondary),0.3)]"
                                : "bg-transparent border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        )}
                    >
                        My Watchlist
                    </button>

                    {([
                        { id: 'top50', label: 'Top 50', activeColor: 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
                        { id: 'gainers', label: 'Gainers', activeColor: 'bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' },
                        { id: 'losers', label: 'Losers', activeColor: 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
                    ] as const).map((f) => (
                        <button
                            key={f.id}
                            onClick={() => { setFilter(f.id); setCurrentPage(1); }}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                                filter === f.id
                                    ? f.activeColor
                                    : "bg-transparent border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="w-full md:w-[25vw]">
                    <Search
                        value={searchQuery}
                        onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                        placeholder={`Search ${assetType === 'stock' ? 'Stocks' : 'Crypto'}...`}
                    />
                </div>
            </div>

            {/* Grid Content */}

            {/* Grid Content */}
            {filteredData.length > 0 ? (
                <MarketGrid
                    coins={paginatedCoins}
                    assetType={assetType}
                    onSelect={(symbol) => console.log(symbol)}
                    watchlistIds={watchlistIds}
                    onWatchlistChange={() => {
                        if (user) {
                            const list = LocalStorage.getWatchlist(user.id);
                            setWatchlistIds(new Set(list.map(item => item.coin_id)));
                        }
                    }}
                />
            ) : (
                <div className="py-12">
                    <ErrorState
                        type={searchQuery ? 'search' : filter === 'watchlist' ? 'empty' : 'error'}
                        title={
                            searchQuery ? "No matches found" :
                                filter === 'watchlist' ? "Your Watchlist is Empty" :
                                    "No Market Data"
                        }
                        message={
                            searchQuery ? `No ${assetType} found matching "${searchQuery}"` :
                                filter === 'watchlist' ? "Star your favorite assets to track them here." :
                                    "We couldn't load any market data. Please try refreshing."
                        }
                        retryAction={filter === 'watchlist' ? undefined : () => window.location.reload()}
                        retryLabel="Refresh Page"
                    />
                </div>
            )}

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )
            }
        </div >
    );
}
