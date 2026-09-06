"use client";

import { Coin } from "@/types";
import { ArrowUpRight, ArrowDownRight, Plus, Brain, Check, Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { LocalStorage } from "@/lib/storage";
import AssetIcon from "./AssetIcon";
import "crypto-icons/font.css";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatUtils";
import { useQueryClient } from "@tanstack/react-query";

interface MarketGridProps {
    coins: Coin[];
    onSelect?: (symbol: string) => void;
    assetType: 'stock' | 'crypto';
    watchlistIds?: Set<string>;
    onWatchlistChange?: () => void;
    source?: 'market' | 'watchlist';
}

export default function MarketGrid({
    coins,
    onSelect,
    assetType,
    watchlistIds: initialWatchlistIds,
    onWatchlistChange,
    source = 'market'
}: MarketGridProps) {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [watchlistIds, setWatchlistIds] = useState<Set<string>>(initialWatchlistIds || new Set());

    useEffect(() => {
        if (initialWatchlistIds) {
            setWatchlistIds(initialWatchlistIds);
        } else if (user) {
            const list = LocalStorage.getWatchlist(user.id);
            setWatchlistIds(new Set(list.map(item => item.coin_id)));
        }
    }, [initialWatchlistIds, user]);

    const handlePrediction = useCallback((coin: Coin) => {
        if (!user) {
            toast.error("Please log in to generate AI predictions.");
            return;
        }
        router.push(`/predictions?predict=${coin.symbol.toUpperCase()}&type=${assetType}&timeframe=4h&source=${source}`);
    }, [user, assetType, router, source]);

    const toggleWatchlist = async (e: React.MouseEvent, coin: Coin) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Please log in to manage your watchlist.");
            return;
        }

        const isPinned = watchlistIds.has(coin.id);

        try {
            const { supabase } = await import("@/lib/supabase");

            if (isPinned) {
                const { error } = await supabase
                    .from('watchlist')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('coin_id', coin.id);

                if (error) throw error;

                LocalStorage.removeFromWatchlist(user.id, coin.id);
                setWatchlistIds(prev => {
                    const next = new Set(prev);
                    next.delete(coin.id);
                    return next;
                });
                toast.success(`Removed ${coin.symbol.toUpperCase()} from watchlist`);
            } else {
                const { error } = await supabase
                    .from('watchlist')
                    .insert({
                        user_id: user.id,
                        coin_id: coin.id,
                        coin_data: coin,
                        asset_type: assetType,
                    } as any);

                if (error) throw error;

                LocalStorage.addToWatchlist(user.id, coin, assetType);
                setWatchlistIds(prev => new Set([...prev, coin.id]));
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
        <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
            {/* Table Header (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-muted/30 font-mono text-[11px] text-muted-foreground uppercase font-semibold">
                <div className="col-span-4">Asset</div>
                <div className="col-span-3 text-right">Price</div>
                <div className="col-span-2 text-right">24h Change</div>
                <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* List of Assets */}
            <div className="divide-y divide-border/50">
                {coins.map((coin, index) => {
                    const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
                    const isPinned = watchlistIds.has(coin.id);
                    const key = `${assetType}-${coin.symbol}-${coin.id ?? index}`;

                    return (
                        <div
                            key={key}
                            className="p-4 md:px-4 md:py-3 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center hover:bg-muted/20 transition-colors group"
                        >
                            {/* Asset Identity */}
                            <div className="md:col-span-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                    <AssetIcon asset={coin} size={24} type={assetType} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-sm text-foreground">
                                            {coin.symbol.toUpperCase()}
                                        </span>
                                        {coin.market_cap_rank && (
                                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted/60 border border-border text-muted-foreground">
                                                #{coin.market_cap_rank}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {coin.name}
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="md:col-span-3 flex md:flex-col justify-between md:justify-center items-center md:items-end">
                                <span className="md:hidden text-xs font-mono text-muted-foreground">Price:</span>
                                <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                                    {formatCurrency(coin.current_price, assetType === 'stock')}
                                </span>
                            </div>

                            {/* 24h Change */}
                            <div className="md:col-span-2 flex md:flex-col justify-between md:justify-center items-center md:items-end">
                                <span className="md:hidden text-xs font-mono text-muted-foreground">24h Change:</span>
                                <span
                                    className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded ${
                                        isPositive
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    }`}
                                >
                                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {isPositive ? "+" : ""}{Number(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-3 flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                                {/* AI Prediction Trigger */}
                                <button
                                    onClick={() => handlePrediction(coin)}
                                    title="Launch AI Confluence Analysis"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 text-xs font-mono font-semibold transition-colors cursor-pointer"
                                >
                                    <Brain className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">AI SIGNAL</span>
                                </button>

                                {/* Watchlist Pin Toggle */}
                                <button
                                    onClick={(e) => toggleWatchlist(e, coin)}
                                    title={isPinned ? "Remove from watchlist" : "Add to watchlist"}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer border",
                                        isPinned
                                            ? "bg-primary/15 text-primary border-primary/30"
                                            : "bg-muted/30 text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {isPinned ? (
                                        <>
                                            <BookmarkCheck className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">PINNED</span>
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">PIN</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

