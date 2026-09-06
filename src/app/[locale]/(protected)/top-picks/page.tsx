"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    RefreshCw,
    TrendingUp,
    Shield,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Zap,
    Coins,
    Building2,
    Layers,
    Cpu,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TopPickItem, AdvisorResponse } from "@/app/api/top-picks/route";

export default function TopPicksPage() {
    const [data, setData] = useState<AdvisorResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "STOCK" | "CRYPTO" | "IPO">("ALL");

    const fetchPicks = async (forceRefresh = false) => {
        if (forceRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetch(`/api/top-picks${forceRefresh ? "?refresh=true" : ""}`);
            if (res.ok) {
                const json = await res.json();
                if (json && json.picks && json.picks.length > 0) {
                    setData(json);
                }
            }
        } catch (err) {
            console.warn("Failed to fetch top picks:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPicks();
    }, []);

    const filteredPicks = data?.picks.filter(p => filter === "ALL" || p.assetType === filter) || [];

    const getAssetBadgeColor = (type: "STOCK" | "CRYPTO" | "IPO") => {
        switch (type) {
            case "STOCK":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "CRYPTO":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "IPO":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        }
    };

    const getAssetIcon = (type: "STOCK" | "CRYPTO" | "IPO") => {
        switch (type) {
            case "STOCK":
                return <TrendingUp className="w-3.5 h-3.5" />;
            case "CRYPTO":
                return <Coins className="w-3.5 h-3.5" />;
            case "IPO":
                return <Building2 className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card/80 to-primary/5 p-6 md:p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase bg-primary/10 text-primary border border-primary/20">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>20+ Neural Models Cascade</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>Real-Time Synthesizer</span>
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-foreground">
                            Top 10 High-Conviction Investment Picks
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                            Multi-agent consensus combining equities, cryptocurrencies, and primary Groww IPOs with detailed fundamental and technical reasoning for every asset.
                        </p>
                    </div>

                    {/* Master Action Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        <button
                            onClick={() => fetchPicks(true)}
                            disabled={refreshing || loading}
                            className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-black font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
                        >
                            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                            <span>{refreshing ? "Synthesizing Consensus..." : "Scan & Regenerate Top 10"}</span>
                        </button>
                    </div>
                </div>

                {/* AI Model Intelligence Bar */}
                {data && (
                    <div className="mt-6 pt-5 border-t border-border/70 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Cpu className="w-4 h-4 text-primary shrink-0" />
                            <span>Active Neural Engine:</span>
                            <span className="text-foreground font-semibold px-2 py-0.5 rounded bg-muted border border-border">
                                {data.activeModel}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span>Resilient Fallback Pool: <strong className="text-foreground">{data.modelsPoolCount || 21}+ Free LLMs</strong></span>
                            <span>•</span>
                            <span>Updated: <strong className="text-foreground">{new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Strategic Summary Note */}
            {data?.investmentSummary && (
                <div className="p-4 rounded-xl bg-card/60 border border-border flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[11px] font-mono uppercase font-bold text-muted-foreground tracking-wider block">
                            PORTFOLIO ALLOCATION STRATEGY
                        </span>
                        <p className="text-xs md:text-sm text-foreground/90 font-sans mt-0.5 leading-relaxed">
                            {data.investmentSummary}
                        </p>
                    </div>
                </div>
            )}

            {/* Asset Class Filter Tabs */}
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                    {(["ALL", "STOCK", "CRYPTO", "IPO"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border",
                                filter === t
                                    ? "bg-primary text-black border-primary font-bold shadow-sm"
                                    : "bg-card text-muted-foreground hover:text-foreground border-border hover:border-primary/40"
                            )}
                        >
                            {t === "ALL" ? "All Top 10 Picks" : t === "STOCK" ? "Equities (NSE/BSE)" : t === "CRYPTO" ? "Digital Assets" : "Groww Live IPOs"}
                        </button>
                    ))}
                </div>
                <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                    Showing {filteredPicks.length} high-conviction assets
                </span>
            </div>

            {/* Content Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 rounded-xl bg-card/40 border border-border animate-pulse p-6 space-y-4">
                            <div className="h-6 w-48 bg-muted rounded" />
                            <div className="h-16 w-full bg-muted/60 rounded" />
                            <div className="h-8 w-32 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredPicks.map((pick, index) => (
                            <motion.div
                                key={pick.id || index}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                className="group rounded-xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                            >
                                <div>
                                    {/* Card Header: Rank, Asset, Target */}
                                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/80">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center font-mono font-bold text-xs text-foreground shrink-0">
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-display font-bold text-base text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                        {pick.name}
                                                    </h3>
                                                    {pick.badge && (
                                                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 font-medium">
                                                            {pick.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1", getAssetBadgeColor(pick.assetType))}>
                                                        {getAssetIcon(pick.assetType)}
                                                        <span>{pick.assetType}</span>
                                                    </span>
                                                    <span className="text-xs font-mono font-semibold text-muted-foreground">
                                                        {pick.symbol}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                                                Target
                                            </span>
                                            <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                                                {pick.expectedGain}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Why You Should Invest Rationale */}
                                    <div className="py-3.5 space-y-1.5 border-b border-border/60">
                                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-primary font-bold tracking-wider">
                                            <Sparkles className="w-3 h-3" />
                                            <span>WHY YOU SHOULD INVEST</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                                            {pick.rationale}
                                        </p>
                                    </div>

                                    {/* Catalysts List */}
                                    <div className="py-3 border-b border-border/60 space-y-1.5">
                                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold block">
                                            PRIMARY DRIVERS & CATALYSTS
                                        </span>
                                        <ul className="space-y-1 text-[11px] text-foreground/90 font-sans">
                                            {pick.catalysts.map((cat, ci) => (
                                                <li key={ci} className="flex items-start gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span>{cat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Key Quantitative Metrics */}
                                    <div className="grid grid-cols-3 gap-2 py-3 font-mono text-xs">
                                        {pick.keyMetrics.map((km, mi) => (
                                            <div key={mi} className="p-2 rounded-lg bg-background/80 border border-border/60">
                                                <span className="text-[9px] text-muted-foreground uppercase block truncate">
                                                    {km.label}
                                                </span>
                                                <span className="font-bold text-foreground tabular-nums block truncate mt-0.5">
                                                    {km.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Footer: Horizon & Direct Hub Link */}
                                <div className="mt-2 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-mono">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="w-3 h-3 text-primary" />
                                        <span>Horizon: <strong className="text-foreground">{pick.timeHorizon}</strong></span>
                                    </div>

                                    <Link
                                        href={
                                            pick.assetType === "IPO"
                                                ? "/ipo"
                                                : pick.assetType === "CRYPTO"
                                                    ? "/crypto"
                                                    : "/stocks"
                                        }
                                        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                                    >
                                        <span>Explore Terminal</span>
                                        <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

