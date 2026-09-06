"use client";

import { useState } from "react";
import { Coin } from "@/types";
import { Search } from "../dashboard/Search";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { LocalStorage } from "@/lib/storage";
import { Eye, Bookmark, BookmarkCheck, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import AssetIcon from "./AssetIcon";
import "crypto-icons/font.css";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatUtils";
import { useQueryClient } from "@tanstack/react-query";

interface MarketTableProps {
    coins: Coin[];
    onSelect?: (symbol: string) => void;
    assetType?: 'stock' | 'crypto';
    watchlistIds?: Set<string>;
    onWatchlistChange?: () => void;
}

export default function MarketTable({
    coins,
    onSelect,
    assetType = 'stock',
    watchlistIds = new Set(),
    onWatchlistChange
}: MarketTableProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const itemsPerPage = 8;

    const filteredCoins = coins.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredCoins.length / itemsPerPage));
    const paginatedCoins = filteredCoins.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleWatchlist = async (e: React.MouseEvent, coin: Coin) => {
        e.stopPropagation();

        if (!user) {
            toast.error("Please log in to manage your watchlist.");
            return;
        }

        const isPinned = watchlistIds.has(coin.id);

        try {
            if (isPinned) {
                const { error } = await supabase
                    .from('watchlist')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('coin_id', coin.id);

                if (error) throw error;

                LocalStorage.removeFromWatchlist(user.id, coin.id);
                toast.success(`Removed ${coin.symbol.toUpperCase()} from watchlist`);
            } else {
                const { error } = await supabase.from('watchlist').insert({
                    user_id: user.id,
                    coin_id: coin.id,
                    coin_data: coin,
                    asset_type: assetType
                } as any);

                if (error) throw error;

                LocalStorage.addToWatchlist(user.id, coin, assetType);
                toast.success(`Added ${coin.symbol.toUpperCase()} to watchlist`);
            }

            await queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            onWatchlistChange?.();
        } catch (err: any) {
            toast.error(err.message || "Failed to update watchlist");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-display text-foreground">
                        {assetType === 'stock' ? 'Equities' : 'Digital Assets'}
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                        ({filteredCoins.length} tracked)
                    </span>
                </div>
                <div className="w-full sm:w-72">
                    <Search
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }}
                        placeholder={`Filter ${assetType === 'stock' ? 'stocks' : 'crypto'}...`}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                            <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[11px] font-semibold">
                                <th className="py-3 px-4 text-left">Asset</th>
                                <th className="py-3 px-4 text-right">Price</th>
                                <th className="py-3 px-4 text-right">24h Change</th>
                                <th className="py-3 px-4 text-center hidden md:table-cell">Market Cap</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {paginatedCoins.map((coin) => {
                                const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
                                const isPinned = watchlistIds.has(coin.id);

                                return (
                                    <tr
                                        key={coin.id}
                                        onClick={() => onSelect ? onSelect(coin.symbol) : router.push(`/market`)}
                                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-md bg-muted/40 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                                    <AssetIcon asset={coin} type={assetType} size={22} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {coin.symbol.toUpperCase()}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground truncate max-w-[160px] font-sans">
                                                        {coin.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-right font-bold text-foreground tabular-nums">
                                            {formatCurrency(coin.current_price, assetType === 'stock')}
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <span
                                                className={`inline-flex items-center gap-0.5 font-bold tabular-nums px-2 py-0.5 rounded ${
                                                    isPositive
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                }`}
                                            >
                                                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {isPositive ? "+" : ""}{Number(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                                            </span>
                                        </td>

                                        <td className="py-3 px-4 text-center hidden md:table-cell text-muted-foreground tabular-nums">
                                            {coin.market_cap && coin.market_cap > 0
                                                ? `$${(coin.market_cap / 1_000_000_000).toFixed(2)}B`
                                                : coin.market_cap_rank
                                                    ? `#${coin.market_cap_rank}`
                                                    : "—"}
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onSelect) onSelect(coin.symbol);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer text-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">CHART</span>
                                                </button>

                                                <button
                                                    onClick={(e) => toggleWatchlist(e, coin)}
                                                    className={cn(
                                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded border transition-colors cursor-pointer text-xs",
                                                        isPinned
                                                            ? "bg-primary/15 text-primary border-primary/30"
                                                            : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    {isPinned ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                                    <span className="hidden sm:inline">{isPinned ? "PINNED" : "PIN"}</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredCoins.length === 0 && (
                    <div className="py-10 text-center text-xs font-mono text-muted-foreground">
                        No assets matched your search query.
                    </div>
                )}
            </div>

            {filteredCoins.length > itemsPerPage && (
                <div className="flex items-center justify-between pt-2 font-mono text-xs text-muted-foreground">
                    <div>
                        Page <span className="text-foreground font-semibold tabular-nums">{currentPage}</span> of <span className="text-foreground font-semibold tabular-nums">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>PREV</span>
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

