"use client";

import React from "react";
import { Coin } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Layers,
    ArrowRight,
    BrainCircuit,
    Compass,
    Eye,
    Globe2,
    ShieldCheck,
    Zap
} from "lucide-react";
import Link from "next/link";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { useTranslations } from "next-intl";
import { MarketIndices } from "./MarketIndices";
import { MarketActivityBento } from "./MarketActivityBento";
import { HighConvictionPanel } from "./HighConvictionPanel";
import AssetIcon from "./AssetIcon";

function DashboardSkeleton() {
    return (
        <div className="space-y-6 pb-10">
            <div className="h-10 w-72 rounded-lg bg-muted/30 animate-pulse border border-border" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse border border-border" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 h-80 rounded-xl bg-muted/20 animate-pulse border border-border" />
                <div className="lg:col-span-4 h-80 rounded-xl bg-muted/20 animate-pulse border border-border" />
            </div>
        </div>
    );
}

export default function ClientDashboard({ initialData }: { initialData: Coin[] }) {
    const { user } = useAuth();
    const { data, isLoading, isInitialized } = useDashboard();
    const t = useTranslations('Dashboard');

    if (!isInitialized && isLoading) return <DashboardSkeleton />;

    const { stats, topWatchlist } = data;
    const totalWatchlist = (stats.stockCount || 0) + (stats.cryptoCount || 0);

    const getPriceData = (coinId?: string, symbol?: string) => {
        if (!coinId && !symbol) return null;
        const sLower = symbol?.toLowerCase();
        return initialData.find(c => (coinId && c.id === coinId) || (sLower && c.symbol?.toLowerCase() === sLower)) || null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pb-8"
        >
            {/* Terminal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-card border border-border">
                        <SolarisIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                                Trading Terminal Overview
                            </h1>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                FEED LIVE
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Unified telemetry across NSE, BSE, and Global Digital Assets
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                    <Link
                        href="/top-picks"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:brightness-110 transition-all shadow-md shadow-orange-500/10"
                    >
                        <Zap className="w-3.5 h-3.5 fill-black" />
                        <span>Top 10 Picks</span>
                    </Link>
                    <Link
                        href="/market"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card border border-border text-foreground font-semibold hover:bg-muted transition-all shadow-sm"
                    >
                        <Compass className="w-3.5 h-3.5 text-primary" />
                        <span>Launch Screener</span>
                    </Link>
                </div>
            </div>

            {/* Market Benchmark Indices (Nifty 50, Sensex, Bank Nifty) */}
            <MarketIndices />

            {/* Asymmetric Portfolio & Market Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Tracked Universe */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                                MARKET COVERAGE
                            </span>
                            <div className="text-2xl font-bold font-mono text-foreground tabular-nums mt-1">
                                {(stats.totalStocks + stats.totalCrypto).toLocaleString()}+
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-muted border border-border text-primary">
                            <Globe2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs font-mono">
                        <div>
                            <span className="text-muted-foreground text-[10px] block">EQUITIES</span>
                            <Link href="/stocks" className="font-bold text-foreground hover:text-primary transition-colors tabular-nums">
                                {stats.totalStocks.toLocaleString()} Stocks →
                            </Link>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] block">CRYPTO</span>
                            <Link href="/crypto" className="font-bold text-foreground hover:text-primary transition-colors tabular-nums">
                                {stats.totalCrypto.toLocaleString()} Tokens →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Personal Watchlist */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                                ACTIVE WATCHLIST
                            </span>
                            <div className="text-2xl font-bold font-mono text-foreground tabular-nums mt-1">
                                {totalWatchlist} Assets
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-muted border border-border text-primary">
                            <Eye className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs font-mono">
                        <div>
                            <span className="text-muted-foreground text-[10px] block">STOCKS</span>
                            <span className="font-bold text-foreground tabular-nums">{stats.stockCount || 0} tracked</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-[10px] block">CRYPTO</span>
                            <span className="font-bold text-foreground tabular-nums">{stats.cryptoCount || 0} tracked</span>
                        </div>
                    </div>
                </div>

                {/* 3. AI Predictive Signals */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                                AI SIGNAL GENERATION
                            </span>
                            <div className="text-2xl font-bold font-mono text-primary tabular-nums mt-1">
                                {(data.recentPredictions || []).length} Signals
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <BrainCircuit className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs font-mono">
                        <span className="text-muted-foreground">Multi-Agent ML Engine</span>
                        <Link href="/predictions" className="font-bold text-primary hover:underline inline-flex items-center gap-1">
                            <span>Open Matrix</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* High Conviction Picks */}
            <HighConvictionPanel />

            {/* Market Activity Bento Grid */}
            <MarketActivityBento />

            {/* Watchlist Quick Access */}
            {topWatchlist && topWatchlist.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-bold text-foreground font-display">Watchlist Quick Monitor</h3>
                        </div>
                        <Link href="/watchlist" className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1">
                            <span>Manage Full Watchlist ({totalWatchlist})</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {topWatchlist.slice(0, 4).map((item) => {
                            const rawCoin = item.coin_data || item;
                            const rawSym = rawCoin.symbol || item.symbol || item.coin_id || "";
                            const symbol = rawSym ? String(rawSym).toUpperCase() : "ASSET";
                            const name = rawCoin.name || item.name || symbol;
                            const assetType = (item.asset_type || rawCoin.asset_type || 'crypto') as 'stock' | 'crypto';
                            const priceInfo = getPriceData(item.coin_id || rawCoin.id, symbol);
                            const price = priceInfo?.current_price ?? rawCoin.current_price ?? item.last_price ?? 0;
                            const change = priceInfo?.price_change_percentage_24h ?? rawCoin.price_change_percentage_24h ?? item.change_percent ?? 0;
                            const isPositive = change >= 0;

                            return (
                                <div key={item.id || item.coin_id || symbol} className="p-3 rounded-lg border border-border bg-background flex flex-col justify-between">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <AssetIcon
                                                asset={{
                                                    id: item.coin_id || rawCoin.id || symbol,
                                                    symbol: symbol,
                                                    name: name,
                                                    image: rawCoin.image || item.image,
                                                    asset_type: assetType
                                                } as any}
                                                size={28}
                                                type={assetType}
                                            />
                                            <div>
                                                <div className="font-mono font-bold text-xs text-foreground">{symbol}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{assetType}</div>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-mono font-semibold tabular-nums ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                                            {isPositive ? "+" : ""}{Number(change).toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-muted-foreground">Price</span>
                                        <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                                            {assetType === 'stock'
                                                ? `₹${Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                                                : `$${Number(price).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
