import { Coin } from "@/types";
import { ArrowUpRight, ArrowDownRight, Plus, Brain, Check } from "lucide-react";
import Image from "next/image";
import { getLogoUrl } from "@/lib/imageUtils";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { LocalStorage } from "@/lib/storage";
import AssetIcon from "./AssetIcon";
import "crypto-icons/font.css";
import { toast } from "sonner";

interface MarketGridProps {
    coins: Coin[];
    onSelect?: (symbol: string) => void;
    assetType: 'stock' | 'crypto';
    watchlistIds?: Set<string>;
    onWatchlistChange?: () => void;
}

export default function MarketGrid({
    coins,
    onSelect,
    assetType,
    watchlistIds: initialWatchlistIds,
    onWatchlistChange
}: MarketGridProps) {
    const { user } = useAuth();
    const [watchlistIds, setWatchlistIds] = useState<Set<string>>(initialWatchlistIds || new Set());

    // Fallback sync if ids not passed (e.g. directly used)
    useEffect(() => {
        if (initialWatchlistIds) {
            setWatchlistIds(initialWatchlistIds);
        } else if (user) {
            const list = LocalStorage.getWatchlist(user.id);
            setWatchlistIds(new Set(list.map(item => item.coin_id)));
        }
    }, [initialWatchlistIds, user]);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {coins.map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0;

                return (
                    <div
                        key={coin.id}
                        onClick={() => onSelect?.(coin.symbol)}
                        className="relative group overflow-hidden rounded-2xl bg-neutral-900/50 border border-white/5 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer"
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                            {/* Top Row: Info & Actions */}
                            <div className="flex justify-between items-start gap-2 w-full">
                                {/* Left: Logo & Name */}
                                <div className="flex gap-3 md:gap-4 items-center min-w-0">
                                    <AssetIcon
                                        asset={coin}
                                        size={44}
                                        type={assetType}
                                        containerClassName="w-10 h-10 md:w-11 md:h-11 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base md:text-lg font-black tracking-tight text-foreground leading-tight truncate">
                                            {coin.symbol.toUpperCase()}
                                        </h3>
                                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium truncate">
                                            {coin.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                                    <button
                                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all shadow-sm z-20"
                                        title={assetType === 'crypto' ? "AI Prediction" : "Predictions only for Crypto"}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (assetType !== 'crypto') {
                                                toast.error("AI Predictions are currently only available for Crypto assets.");
                                                return;
                                            }
                                            if (!user) {
                                                toast.error("Please login to use AI features.");
                                                return;
                                            }

                                            try {
                                                e.currentTarget.style.transform = 'scale(0.9)';
                                                const response = await fetch("/api/predictions", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        coin: coin.symbol.toUpperCase(),
                                                        timeframe: "4h",
                                                        userId: user.id
                                                    })
                                                });

                                                if (response.ok) {
                                                    toast.success(`Prediction requested for ${coin.name}!`);
                                                } else {
                                                    toast.error("Failed to trigger prediction.");
                                                }
                                                e.currentTarget.style.transform = 'scale(1)';
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Error connecting to prediction service.");
                                            }
                                        }}
                                    >
                                        <Brain size={16} strokeWidth={2} />
                                    </button>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (watchlistIds.has(coin.id)) return;

                                            if (!user) {
                                                import('sonner').then(({ toast }) => toast.error("Please login to use watchlist"));
                                                return;
                                            }

                                            try {
                                                const { LocalStorage } = await import("@/lib/storage");
                                                const { supabase } = await import("@/lib/supabase");
                                                const { toast } = await import("sonner");

                                                // 1. LocalStorage
                                                const localResult = LocalStorage.addToWatchlist(user.id, coin, assetType);

                                                if (!localResult) {
                                                    toast.error("Item already in your watchlist!");
                                                    return;
                                                }

                                                toast.success("Added to Watchlist!");
                                                onWatchlistChange?.();
                                                // Local update for immediate feedback
                                                setWatchlistIds(prev => new Set([...prev, coin.id]));

                                                // 2. Supabase
                                                supabase.from('watchlist').insert({
                                                    user_id: user.id,
                                                    coin_id: coin.id,
                                                    coin_data: coin,
                                                    asset_type: assetType
                                                } as any).then(({ error }: any) => {
                                                    if (error) {
                                                        console.error("Supabase Backup Sync Failed:", error);
                                                        toast.error("Failed to sync with cloud. Changes saved locally.");

                                                        // Rollback optimistic update
                                                        setWatchlistIds(prev => {
                                                            const next = new Set(prev);
                                                            next.delete(coin.id);
                                                            return next;
                                                        });
                                                    }
                                                });
                                            } catch (err) {
                                                console.error("Watchlist Error:", err);
                                            }
                                        }}
                                        disabled={watchlistIds.has(coin.id)}
                                        className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all shadow-lg z-20 ${watchlistIds.has(coin.id)
                                            ? "bg-green-500/20 text-green-500 cursor-default border border-green-500/30"
                                            : "bg-primary text-black hover:bg-primary/80 shadow-primary/20"
                                            }`}
                                        title={watchlistIds.has(coin.id) ? "Already in Watchlist" : "Add to Watchlist"}
                                    >
                                        {watchlistIds.has(coin.id) ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Row: Price & Stats */}
                            <div className="mt-4 w-full">
                                <div className="text-xl md:text-2xl font-black tracking-tight text-foreground mb-0.5">
                                    {assetType === 'stock' ? '₹' : '$'}
                                    {coin.current_price.toLocaleString()}
                                </div>

                                <div className={`flex items-center gap-0.5 text-[11px] md:text-xs font-bold ${isPositive ? 'text-[#00cc88]' : 'text-rose-500'}`}>
                                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={3} /> : <ArrowDownRight className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={3} />}
                                    <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
