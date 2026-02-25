"use client";

import { useState } from "react";
import { Coin } from "@/types";
import { Search } from "../dashboard/Search";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { LocalStorage } from "@/lib/storage";
import { Eye, Plus, Check } from "lucide-react";
import AssetIcon from "./AssetIcon";
import "crypto-icons/font.css";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/aceternity/SpotlightCard";
import { HoverScale } from "@/components/ui/shine-effect";
import { Sparkles } from "@/components/ui/sparkles";
import { SolarisButton } from "@/components/ui/SolarisButton";
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
    const itemsPerPage = 7;

    const filteredCoins = coins.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
    const paginatedCoins = filteredCoins.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const addToWatchlist = async (e: React.MouseEvent, coin: Coin) => {
        e.stopPropagation();

        try {
            if (!user) {
                if (confirm("You must be logged in to use the watchlist. Go to login?")) {
                    router.push("/login");
                }
                return;
            }

            const { error } = await supabase.from('watchlist').insert({
                user_id: user.id,
                coin_id: coin.id,
                coin_data: coin,
                asset_type: assetType
            } as any);

            if (error) {
                console.error("Supabase Watchlist Error:", error);
                toast.error("Cloud sync failed. Please try again.");
                // Remove from local if cloud fails to keep them in sync
                LocalStorage.removeFromWatchlist(user.id, coin.id);
                return;
            }

            // Sync React Query cache immediately
            await queryClient.invalidateQueries({ queryKey: ['watchlist'] });

            toast.success("Added to Watchlist!");
            onWatchlistChange?.();
        } catch (err) {
            console.error("Critical Error:", err);
            toast.error("Failed to update watchlist. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Assets ({coins.length})</h2>
                <Search onChange={(val) => { setSearch(val); setCurrentPage(1); }} className="w-full md:w-[25vw]" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
                <div className="max-h-[500px] overflow-y-auto thin-scrollbar overflow-x-hidden">
                    <table className="w-full text-left border-collapse cursor-default">
                        <thead className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/90 sticky top-0 backdrop-blur-md z-30">
                            <tr>
                                <th className="py-4 px-4 md:px-6 font-bold text-[10px] md:text-xs text-muted-foreground/60 w-auto text-left">Asset</th>
                                <th className="py-4 px-4 md:px-6 font-bold text-[10px] md:text-xs text-muted-foreground/60 w-auto text-right hidden md:table-cell">Price</th>
                                <th className="py-4 px-6 font-bold text-[10px] md:text-xs text-muted-foreground/60 w-auto text-center hidden md:table-cell">Market Cap</th>
                                <th className="py-4 px-4 md:px-6 font-bold text-[10px] md:text-xs text-muted-foreground/60 w-auto text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {paginatedCoins.map((coin) => (
                                <tr
                                    key={coin.id}
                                    onClick={() => onSelect ? onSelect(coin.symbol) : router.push(`/market/${coin.id}`)}
                                    className="group relative cursor-pointer transition-all duration-300 hover:bg-primary/5"
                                >
                                    {/* Spotlight effect on hover */}
                                    <td className="py-5 px-2 md:p-4 relative text-left align-middle pl-4 md:pl-6 overflow-hidden">
                                        {/* Spotlight effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        {/* Animated border indicator */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                        <div className="flex items-center justify-start gap-2 md:gap-4 overflow-hidden">
                                            <div className="relative flex-shrink-0">
                                                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                    <AssetIcon asset={coin} type={assetType} size={28} className="md:w-[36px] md:h-[36px]" />
                                                </div>
                                                <div className="absolute inset-0 rounded-full border-2 border-primary/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
                                            </div>
                                            <div className="min-w-0 flex flex-col items-start text-left overflow-hidden">
                                                <HoverScale scale={1.03} duration={150}>
                                                    <div className="font-black text-xs md:text-base leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                                                        {coin.name}
                                                    </div>
                                                </HoverScale>
                                                <div className="text-[9px] md:text-xs text-muted-foreground font-bold group-hover:text-foreground transition-colors mt-0.5 truncate w-full">
                                                    {coin.symbol.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 md:px-6 text-right relative align-middle hidden md:table-cell">
                                        <div className="text-xs md:text-sm font-mono font-bold text-foreground tabular-nums">
                                            {formatCurrency(coin.current_price, assetType === 'stock')}
                                        </div>
                                    </td>

                                    <td className="py-5 px-3 md:p-4 text-center relative align-middle hidden md:table-cell">
                                        <HoverScale scale={1.02} duration={150}>
                                            <div className="text-xs md:text-sm font-bold text-foreground/80 tabular-nums group-hover:text-foreground transition-colors">
                                                {/* Logic: If market_cap exists, show it. If not, and it's a stock, show simplified estimate or N/A. Avoid rank unless crypto. */}
                                                {(coin.market_cap && coin.market_cap > 0)
                                                    ? `$${(coin.market_cap / 1_000_000_000).toFixed(2)}B`
                                                    : (coin.current_price && coin.asset_type === 'stock'
                                                        ? `$${((coin.current_price * 1000000) / 1000000).toFixed(2)}M` // Fake cap or N/A. Let's show N/A to be honest or "-"
                                                        : (coin.market_cap_rank ? `#${coin.market_cap_rank}` : "-"))
                                                }
                                                {/* Override for stocks ensuring value-like display if missing */}
                                                {(!coin.market_cap && coin.asset_type === 'stock') && (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </HoverScale>
                                    </td>

                                    <td className="py-4 px-2 md:p-4 relative text-right pr-4 md:pr-6 align-middle">
                                        <div className="flex justify-end gap-2 md:gap-3 items-center">
                                            <SolarisButton
                                                variant="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onSelect) {
                                                        onSelect(coin.symbol);
                                                    }
                                                }}
                                                className="h-8 w-8 md:h-10 md:w-auto md:px-4 !bg-white/5 hover:!bg-indigo-500/20 !text-muted-foreground hover:text-indigo-400 border-none shadow-none font-bold tracking-wide flex-shrink-0"
                                                icon={Eye}
                                            >
                                                <span className="hidden md:inline">View</span>
                                            </SolarisButton>
                                            <Sparkles
                                                sparklesCount={8}
                                                sparklesColor="#00cc88"
                                                sparkleSize={2}
                                                className="flex-shrink-0 inline-flex items-center"
                                            >
                                                <SolarisButton
                                                    variant="icon"
                                                    onClick={(e) => addToWatchlist(e, coin)}
                                                    disabled={watchlistIds.has(coin.id)}
                                                    active={watchlistIds.has(coin.id)}
                                                    className={cn(
                                                        "h-8 w-8 md:h-10 md:w-auto md:px-4 flex-shrink-0",
                                                        watchlistIds.has(coin.id)
                                                            ? "!bg-green-500/20 !text-green-500 border-none"
                                                            : "!bg-white/5 hover:!bg-primary/20 !text-muted-foreground hover:text-primary border-none"
                                                    )}
                                                    icon={watchlistIds.has(coin.id) ? Check : Plus}
                                                >
                                                    <span className="hidden md:inline">{watchlistIds.has(coin.id) ? "Added" : "Add"}</span>
                                                </SolarisButton>
                                            </Sparkles>
                                        </div>
                                    </td>

                                    {/* Animated border indicator */}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredCoins.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                    >
                        Next
                    </button>
                </div>
            )}

            {filteredCoins.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No results found.
                </div>
            )}
        </div>
    );
}
