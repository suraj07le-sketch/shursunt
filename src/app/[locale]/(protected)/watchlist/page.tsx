"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { WatchlistItem } from "@/types";
import { LocalStorage } from "@/lib/storage";
import { Trash2, Brain, ChevronDown, ArrowUpRight, ArrowDownRight, ArrowRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AssetIcon from "@/components/dashboard/AssetIcon";
import { useWatchlist } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Link from "next/link";

function WatchlistRow({ item, onDelete }: { item: WatchlistItem; onDelete: (id: string) => void }) {
    const { user } = useAuth();
    const router = useRouter();
    const [timeframe, setTimeframe] = useState("4h");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handlePredict = () => {
        if (!user) {
            toast.error("Please log in to generate AI predictions.");
            return;
        }

        const symbol = (item.coin_data?.symbol || "").toUpperCase();
        const type = item.asset_type || 'crypto';
        router.push(`/predictions?predict=${symbol}&type=${type}&timeframe=${timeframe}&source=watchlist`);
    };

    const price = item.coin_data?.current_price ?? 0;
    const change = item.coin_data?.price_change_percentage_24h ?? 0;
    const isPositive = change >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors">
            {/* 1. Identity (Col 1-4) */}
            <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    <AssetIcon asset={item.coin_data} size={30} type={item.asset_type} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-mono font-bold text-sm text-foreground truncate">
                            {item.coin_data?.symbol?.toUpperCase()}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground uppercase">
                            {item.asset_type || 'crypto'}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-sans">
                        {item.coin_data?.name}
                    </p>
                </div>
            </div>

            {/* 2. Price Data (Col 5-7) */}
            <div className="col-span-6 md:col-span-3">
                <div className="text-[11px] font-mono text-muted-foreground mb-0.5">CURRENT PRICE</div>
                <div className="flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold text-foreground tabular-nums">
                        {item.asset_type === 'stock' ? '₹' : '$'}{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-mono font-semibold flex items-center tabular-nums ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? "+" : ""}{Number(change).toFixed(2)}%
                    </span>
                </div>
            </div>

            {/* 3. Action / AI trigger (Col 8-12) */}
            <div className="col-span-6 md:col-span-5 flex items-center justify-end gap-2">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="h-8 px-2.5 rounded-lg border border-border bg-background text-foreground text-xs font-mono flex items-center gap-1.5 hover:bg-muted transition-colors cursor-pointer"
                    >
                        <span className="uppercase font-semibold">{timeframe}</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-9 w-24 bg-card border border-border rounded-lg shadow-xl py-1 z-30 font-mono text-xs">
                            {["1h", "4h", "1d", "1w"].map((tf) => (
                                <button
                                    key={tf}
                                    type="button"
                                    onClick={() => {
                                        setTimeframe(tf);
                                        setDropdownOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-1.5 hover:bg-muted transition-colors uppercase font-semibold",
                                        timeframe === tf ? "text-primary bg-primary/10" : "text-foreground"
                                    )}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handlePredict}
                    className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                    <Brain className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Predict</span>
                </button>

                <button
                    onClick={() => onDelete(item.id)}
                    className="h-8 w-8 rounded-lg border border-border bg-background hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove from Watchlist"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function WatchlistPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<"ALL" | "STOCKS" | "CRYPTO">("ALL");

    const { data: rawWatchlist = [], isLoading } = useWatchlist();
    const watchlist: WatchlistItem[] = (rawWatchlist as WatchlistItem[]) || [];

    const handleDelete = async (id: string) => {
        try {
            if (user) {
                const { error } = await supabase.from("watchlist").delete().eq("id", id);
                if (error) throw error;
            } else {
                LocalStorage.removeFromWatchlist("anonymous", id);
            }

            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            toast.success("Instrument removed from watchlist");
        } catch {
            toast.error("Failed to remove item from watchlist");
        }
    };

    const filteredList = watchlist.filter((item: WatchlistItem) => {
        if (filter === "STOCKS") return item.asset_type === "stock";
        if (filter === "CRYPTO") return item.asset_type === "crypto" || !item.asset_type;
        return true;
    });

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Terminal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                        <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                                Active Watchlist
                            </h1>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border tabular-nums font-semibold">
                                {watchlist.length} MONITORED
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Real-time tracking and quick neural confluence signal generation
                        </p>
                    </div>
                </div>

                {/* Filter Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card">
                    {(["ALL", "STOCKS", "CRYPTO"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={cn(
                                "px-3 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer",
                                filter === tab
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            ) : filteredList.length === 0 ? (
                <div className="p-12 rounded-xl border border-dashed border-border bg-card/40 text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground font-display">No monitored instruments found</h3>
                        <p className="text-xs text-muted-foreground font-mono">
                            Add Indian equities or crypto tokens to your watchlist from the market screener.
                        </p>
                    </div>
                    <div>
                        <Link
                            href="/market"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:bg-primary/90 transition-all shadow-sm"
                        >
                            <span>Open Market Screener</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredList.map((item: WatchlistItem) => (
                        <WatchlistRow
                            key={item.id}
                            item={item}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

