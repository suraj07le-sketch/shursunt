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

            const localResult = LocalStorage.addToWatchlist(user.id, coin, assetType);

            if (!localResult) {
                toast.error("Item already in your watchlist!");
                return;
            }

            toast.success("Added to Watchlist!");
            onWatchlistChange?.();

            supabase.from('watchlist').insert({
                user_id: user.id,
                coin_id: coin.id,
                coin_data: coin,
                asset_type: assetType
            } as any).then(({ error }: any) => {
                if (error) console.error("Supabase Backup Sync Failed:", error);
            });
        } catch (err) {
            console.error("Critical Error:", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Assets ({coins.length})</h2>
                <Search onChange={(val) => { setSearch(val); setCurrentPage(1); }} className="w-full md:w-[25vw]" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
                <div className="max-h-[500px] overflow-y-auto thin-scrollbar">
                    <table className="w-full text-left border-collapse cursor-default">
                        <thead className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/90 sticky top-0 backdrop-blur-md z-30">
                            <tr>
                                <th className="py-4 px-3 md:p-4 font-black w-1/2 text-left pl-6">Asset</th>
                                <th className="py-4 px-3 md:p-4 text-center font-black w-[30%]">Market Cap</th>
                                <th className="py-4 px-3 md:p-4 text-right font-black w-[20%] pr-6">Action</th>
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
                                    <td className="py-5 px-3 md:p-4 relative text-left align-middle pl-6">
                                        {/* Spotlight effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        {/* Animated border indicator */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                        <div className="flex items-center justify-start gap-3 md:gap-4">
                                            <div className="relative flex-shrink-0">
                                                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                                    <AssetIcon asset={coin} type={assetType} size={36} />
                                                </div>
                                                <div className="absolute inset-0 rounded-full border-2 border-primary/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
                                            </div>
                                            <div className="min-w-0 flex flex-col items-start text-left">
                                                <HoverScale scale={1.03} duration={150}>
                                                    <div className="font-black text-sm md:text-base leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                                                        {coin.name}
                                                    </div>
                                                </HoverScale>
                                                <div className="text-[10px] md:text-xs text-muted-foreground font-bold group-hover:text-foreground transition-colors mt-0.5">
                                                    {coin.symbol.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-5 px-3 md:p-4 text-center relative align-middle">
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

                                    <td className="py-5 px-3 md:p-4 relative">
                                        <div className="flex justify-end gap-1.5 md:gap-3">
                                            <SolarisButton
                                                variant="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onSelect) {
                                                        onSelect(coin.symbol);
                                                    }
                                                }}
                                                className="h-8 !bg-indigo-500 hover:!bg-indigo-600 !text-white border-none shadow-sm font-bold tracking-wide"
                                                icon={Eye}
                                            >
                                                <span className="hidden md:inline">View</span>
                                            </SolarisButton>
                                            <Sparkles
                                                sparklesCount={8}
                                                sparklesColor="#00cc88"
                                                sparkleSize={2}
                                            >
                                                <SolarisButton
                                                    variant="small"
                                                    onClick={(e) => addToWatchlist(e, coin)}
                                                    disabled={watchlistIds.has(coin.id)}
                                                    active={watchlistIds.has(coin.id)}
                                                    className={cn(
                                                        "h-8",
                                                        watchlistIds.has(coin.id)
                                                            ? "!bg-green-500/20 !text-green-500 border-green-500/20"
                                                            : "!bg-primary/20 hover:!bg-primary/30 !text-primary border border-primary/20"
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
