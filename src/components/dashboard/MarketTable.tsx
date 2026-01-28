"use client";

import { useState } from "react";
import Image from "next/image";
import { Coin } from "@/types";
import { Search } from "../dashboard/Search";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { LocalStorage } from "@/lib/storage";
import { getLogoUrl } from "@/lib/imageUtils";
import { Eye, Plus, Check } from "lucide-react";
import AssetIcon from "./AssetIcon";
import "crypto-icons/font.css";

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
    const { user } = useAuth(); // Use useAuth for consistent session state
    const itemsPerPage = 7;

    // Filter
    const filteredCoins = coins.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    // Paginate
    const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
    const paginatedCoins = filteredCoins.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const addToWatchlist = async (e: React.MouseEvent, coin: Coin) => {
        e.stopPropagation(); // Prevent row click

        try {
            if (!user) {
                if (confirm("You must be logged in to use the watchlist. Go to login?")) {
                    router.push("/login");
                }
                return;
            }

            // 1. LocalStorage (Primary for this user request)
            const localResult = LocalStorage.addToWatchlist(user.id, coin, assetType);

            if (!localResult) {
                // Duplicate check handled by helper returns null
                toast.error("Item already in your watchlist!");
                return;
            }

            toast.success("Added to Watchlist!");
            onWatchlistChange?.();

            // 2. Supabase (Backup / Cloud Sync - Fire & Forget)
            supabase.from('watchlist').insert({
                user_id: user.id,
                coin_id: coin.id,
                coin_data: coin,
                asset_type: assetType
            } as any).then(({ error }: any) => {
                if (error) console.error("Supabase Backup Sync Failed:", error);
            });

            // Optional: Redirect or just stay
            // router.push("/dashboard/watchlist");
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

            <div className="overflow-hidden rounded-xl border border-border shadow-2xl bg-card/60 backdrop-blur-md flex flex-col">
                <div className="max-h-[500px] overflow-y-auto thin-scrollbar">
                    <table className="w-full text-left border-collapse cursor-default">
                        <thead className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/40">
                            <tr>
                                <th className="py-4 px-3 md:p-4 font-black">Asset</th>
                                <th className="py-4 px-3 md:p-4 text-center font-black">Market Cap</th>
                                <th className="py-4 px-3 md:p-4 text-right font-black">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {paginatedCoins.map((coin) => (
                                <tr
                                    key={coin.id}
                                    onClick={() => onSelect ? onSelect(coin.symbol) : router.push(`/dashboard/market/${coin.id}`)}
                                    className="hover:bg-muted/30 transition-all cursor-pointer group"
                                >
                                    <td className="py-5 px-3 md:p-4">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <AssetIcon asset={coin} type={assetType} size={36} />
                                            <div className="min-w-0">
                                                <div className="font-black text-sm md:text-base leading-tight truncate text-foreground">{coin.name}</div>
                                                <div className="text-[10px] md:text-xs text-muted-foreground font-bold">{coin.symbol.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-5 px-3 md:p-4 text-center">
                                        <div className="text-xs md:text-sm font-bold text-foreground/80 tabular-nums">
                                            {(coin.market_cap || 0) > 0
                                                ? `$${((coin.market_cap || 0) / 1_000_000_000).toFixed(2)}B`
                                                : (coin.market_cap_rank ? `#${coin.market_cap_rank}` : "-")}
                                        </div>
                                    </td>

                                    <td className="py-5 px-3 md:p-4">
                                        <div className="flex justify-end gap-1.5 md:gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onSelect) {
                                                        onSelect(coin.symbol);
                                                    }
                                                }}
                                                className="w-8 h-8 md:w-auto md:px-4 md:py-1.5 flex items-center justify-center rounded-lg bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all border border-border text-[10px] md:text-xs font-black uppercase tracking-tighter text-muted-foreground hover:text-foreground"
                                                title="View Details"
                                            >
                                                <span className="hidden md:inline">View</span>
                                                <Eye size={14} className="md:hidden" />
                                            </button>
                                            <button
                                                onClick={(e) => addToWatchlist(e, coin)}
                                                disabled={watchlistIds.has(coin.id)}
                                                className={`w-8 h-8 md:w-auto md:px-4 md:py-1.5 flex items-center justify-center rounded-lg transition-all border text-[10px] md:text-xs font-black uppercase tracking-tighter shadow-lg ${watchlistIds.has(coin.id)
                                                    ? "bg-green-500/20 text-green-500 border-green-500/30 cursor-default"
                                                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-primary/5"
                                                    }`}
                                                title={watchlistIds.has(coin.id) ? "Already in Watchlist" : "Add to Watchlist"}
                                            >
                                                <span className="hidden md:inline">{watchlistIds.has(coin.id) ? "Added" : "Add"}</span>
                                                {watchlistIds.has(coin.id) ? <Check size={14} className="md:hidden" /> : <Plus size={14} className="md:hidden" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {filteredCoins.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
