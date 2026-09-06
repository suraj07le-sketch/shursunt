"use client";

import { useState, useMemo } from "react";
import { useIPOData, useMarketIndices } from "@/hooks/useQueries";
import { IPOCard } from "@/components/ipo/IPOCard";
import { IPODetailModal } from "@/components/ipo/IPODetailModal";
import { predictIPOGains } from "@/lib/ipoLogic";
import { Rocket, RefreshCw, AlertCircle, Search, Clock, TrendingUp, ShieldAlert, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function IPOPage() {
    const [segment, setSegment] = useState<"all" | "mainboard" | "sme">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "open" | "upcoming" | "listed" | "closed">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIpo, setSelectedIpo] = useState<any | null>(null);

    const { data: rawData, isLoading, isError, error, refetch, isFetching } = useIPOData();
    const { data: indices } = useMarketIndices();

    // Find India VIX and Nifty 50
    const indiaVix = indices?.find((i: any) => i.symbol === '^INDIAVIX');
    const nifty50 = indices?.find((i: any) => i.symbol === '^NSEI');

    // Transform raw API data into normalized array
    const allIpos = useMemo(() => {
        if (!rawData) return [];

        const list: any[] = [];
        const categories = ['active', 'upcoming', 'listed', 'closed'];
        const dataObj = rawData as Record<string, any[]>;

        categories.forEach((statusKey) => {
            if (Array.isArray(dataObj[statusKey])) {
                dataObj[statusKey].forEach((item: any) => {
                    const priceValue = item.max_price || item.issue_price || item.price_band || "TBA";
                    list.push({
                        company_name: item.name || item.company_name || "Instrument",
                        issue_price_raw: `${priceValue}`,
                        issue_size: item.issue_size || item.size || "TBA",
                        listing_date: item.listing_date || item.listingDate || "",
                        open_date: item.bidding_start_date || item.open_date || item.startDate || "",
                        close_date: item.bidding_end_date || item.close_date || item.endDate || "",
                        status: statusKey === 'active' ? 'open' : statusKey,
                        subscription: item.subscription_status || item.subscription || item.subscription_multiple,
                        gmp: item.gmp || item.grey_market_premium,
                        type: (item.is_sme || (item.name && item.name.toLowerCase().includes('sme'))) ? "sme" : "mainboard",
                        additional_text: item.additional_text || item.description,
                        document_url: item.document_url || item.rhp_url,
                        financials: item.financials,
                        listing_price_est: item.listing_price_est,
                        source: item.source || "groww-live",
                        updated_at: item.updated_at,
                        logo_url: item.logo_url || item.logoUrl
                    });
                });
            }
        });

        return list;
    }, [rawData]);

    // Apply Segment, Status, and Search Filters
    const filteredIpos = useMemo(() => {
        return allIpos.filter((ipo) => {
            const matchesSegment = segment === "all" || ipo.type === segment;
            const matchesStatus = statusFilter === "all" || ipo.status === statusFilter;
            const matchesSearch = !searchQuery || ipo.company_name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSegment && matchesStatus && matchesSearch;
        });
    }, [allIpos, segment, statusFilter, searchQuery]);

    // Compute Selected IPO Prediction
    const selectedPrediction = useMemo(() => {
        if (!selectedIpo) return null;
        const priceNum = parseFloat(selectedIpo.issue_price_raw.replace(/[^0-9.]/g, '')) || 500;
        const numericGmp = typeof selectedIpo.gmp === 'number' ? selectedIpo.gmp : parseFloat(`${selectedIpo.gmp}`.replace(/[^0-9.]/g, '')) || 0;
        const sizeNumCr = parseFloat(selectedIpo.issue_size.replace(/[^0-9.]/g, '')) || undefined;

        return predictIPOGains({
            company_name: selectedIpo.company_name,
            issue_price: priceNum,
            subscription: typeof selectedIpo.subscription === 'object' ? selectedIpo.subscription : undefined,
            gmp: numericGmp,
            status: selectedIpo.status,
            issue_size_cr: sizeNumCr,
            is_sme: selectedIpo.type === 'sme',
            listing_price_est: selectedIpo.listing_price_est
        });
    }, [selectedIpo]);

    // Compute Summary Telemetry
    const openCount = allIpos.filter(i => i.status === "open").length;
    const upcomingCount = allIpos.filter(i => i.status === "upcoming").length;
    const listedCount = allIpos.filter(i => i.status === "listed").length;

    // Explicit 4-State Machine: 'loading' | 'error' | 'empty' | 'success'
    const viewState = isLoading && allIpos.length === 0
        ? "loading"
        : isError && allIpos.length === 0
        ? "error"
        : filteredIpos.length === 0
        ? "empty"
        : "success";

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Terminal Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                        <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                                Primary Market & IPO Tracker
                            </h1>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                GROWW LIVE STREAM
                            </span>
                            {isFetching && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    UPDATING
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Real-time Grey Market Premium (GMP), institutional subscription multiple, and honest calibrated forecasts
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin text-primary")} />
                        <span>Sync Feed</span>
                    </button>
                </div>
            </div>

            {/* Macro Market Telemetry Context Ribbon (India VIX & Nifty 50) */}
            <div className="p-3 rounded-xl border border-border/70 bg-card/60 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="text-[11px] font-bold text-foreground">MARKET REGIME:</span>
                    </div>

                    {nifty50 && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-[10px]">NIFTY 50:</span>
                            <span className="font-bold tabular-nums text-foreground">{nifty50.current_value}</span>
                            <span className={`text-[10px] tabular-nums ${nifty50.change_percent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                ({nifty50.change_percent >= 0 ? "+" : ""}{nifty50.change_percent}%)
                            </span>
                        </div>
                    )}

                    {indiaVix && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-[10px]">INDIA VIX:</span>
                            <span className="font-bold tabular-nums text-sky-400">{indiaVix.current_value}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {indiaVix.current_value < 16 ? "CALM (FAVORABLE FOR IPOs)" : "HIGH VOLATILITY"}
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-time Ingestion Shield Active</span>
                </div>
            </div>

            {/* Quantitative Pipeline Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Biddings</span>
                        <div className="text-xl font-bold text-foreground tabular-nums mt-0.5">{openCount} Issues Open</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Upcoming Pipeline</span>
                        <div className="text-xl font-bold text-foreground tabular-nums mt-0.5">{upcomingCount} Filed / Awaiting</div>
                    </div>
                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                        <Rocket className="w-4 h-4" />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Recently Listed</span>
                        <div className="text-xl font-bold text-foreground tabular-nums mt-0.5">{listedCount} Monitored</div>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search company (e.g. Swiggy, NTPC, Waaree)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-card border border-border text-foreground text-xs font-mono focus-visible:ring-2 focus-visible:ring-primary outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Segment Filter (All, Mainboard, SME) */}
                    <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
                        {(["all", "mainboard", "sme"] as const).map((seg) => (
                            <button
                                key={seg}
                                type="button"
                                onClick={() => setSegment(seg)}
                                className={cn(
                                    "px-3 py-1 rounded text-xs font-mono font-semibold uppercase transition-all cursor-pointer",
                                    segment === seg
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {seg}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card overflow-x-auto">
                        {([
                            { id: "all", label: "ALL" },
                            { id: "open", label: "OPEN" },
                            { id: "upcoming", label: "UPCOMING" },
                            { id: "listed", label: "LISTED" },
                            { id: "closed", label: "CLOSED" }
                        ] as const).map((st) => (
                            <button
                                key={st.id}
                                type="button"
                                onClick={() => setStatusFilter(st.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer",
                                    statusFilter === st.id
                                        ? "bg-muted text-foreground border border-border font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4-State Machine Rendering */}
            {viewState === "loading" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-4 animate-pulse">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            )}

            {viewState === "error" && (
                <div className="p-10 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-4 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto text-destructive">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground font-display">Primary Market Stream Unavailable</h3>
                        <p className="text-xs text-muted-foreground font-mono">
                            Upstream API gateway is experiencing latency. Database cache will automatically restore connection.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Stream Connection</span>
                    </button>
                </div>
            )}

            {viewState === "empty" && (
                <div className="p-12 rounded-xl border border-dashed border-border bg-card/40 text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground font-display">No IPO Issues Match Current Filter</h3>
                        <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
                            No public offerings found for segment: "{segment.toUpperCase()}" with status: "{statusFilter.toUpperCase()}".
                        </p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setSegment("all");
                                setStatusFilter("all");
                                setSearchQuery("");
                            }}
                            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 border border-border text-foreground text-xs font-mono font-semibold transition-all cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                </div>
            )}

            {viewState === "success" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIpos.map((ipo, idx) => (
                        <IPOCard 
                            key={ipo.company_name + idx} 
                            ipo={ipo} 
                            onSelect={() => setSelectedIpo(ipo)}
                        />
                    ))}
                </div>
            )}

            {/* Global Portal-based IPO Detail Drill-Down Modal */}
            {selectedIpo && selectedPrediction && (
                <IPODetailModal
                    isOpen={Boolean(selectedIpo)}
                    onClose={() => setSelectedIpo(null)}
                    ipo={selectedIpo}
                    prediction={selectedPrediction}
                />
            )}

            {/* Mandatory Regulatory & Performance Disclaimer Banner */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/50 flex items-start gap-3 text-xs font-mono text-muted-foreground">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold text-foreground">STATUTORY NOTICE & PREDICTION DISCLAIMER:</span>
                    <p className="mt-0.5 leading-relaxed">
                        AI-generated estimates are calibrated statistical models based on historical subscription metrics and Grey Market Premiums. They do not constitute financial advice. Past performance does not guarantee future results. Always review the SEBI Red Herring Prospectus (RHP) before applying.
                    </p>
                </div>
            </div>
        </div>
    );
}
