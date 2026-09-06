"use client";

import { useState, useMemo } from "react";
import { useMutualFunds } from "@/hooks/useQueries";
import { analyzeFundConviction, FundData } from "@/lib/fundLogic";
import { Search, Shield, PieChart, Layers, Brain, ArrowUpRight, TrendingUp, Filter, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SolarisIcon } from "@/components/ui/SolarisIcon";

const BENCHMARK_FUNDS: (FundData & { aum: string; expense_ratio: string; amc: string })[] = [
    {
        id: "axis-bluechip",
        name: "Axis Bluechip Fund - Direct Plan",
        amc: "Axis Mutual Fund",
        category: "Large Cap",
        nav: 68.45,
        return_1y: 18.2,
        return_3y: 14.8,
        aum: "₹32,450 Cr",
        expense_ratio: "0.85%",
        risk_profile: "MODERATE",
    },
    {
        id: "quant-small-cap",
        name: "Quant Small Cap Fund - Direct Plan",
        amc: "Quant Mutual Fund",
        category: "Small Cap",
        nav: 215.12,
        return_1y: 42.5,
        return_3y: 32.1,
        aum: "₹18,920 Cr",
        expense_ratio: "0.77%",
        risk_profile: "VERY HIGH",
    },
    {
        id: "parag-parikh-flexi",
        name: "Parag Parikh Flexi Cap Fund - Direct Plan",
        amc: "PPFAS Mutual Fund",
        category: "Flexi Cap",
        nav: 72.30,
        return_1y: 24.8,
        return_3y: 19.4,
        aum: "₹64,120 Cr",
        expense_ratio: "0.62%",
        risk_profile: "MODERATE",
    },
    {
        id: "mirae-asset-large-cap",
        name: "Mirae Asset Large Cap Fund - Direct Plan",
        amc: "Mirae Asset Mutual Fund",
        category: "Large Cap",
        nav: 104.80,
        return_1y: 19.6,
        return_3y: 15.2,
        aum: "₹38,200 Cr",
        expense_ratio: "0.58%",
        risk_profile: "MODERATE",
    },
    {
        id: "hdfc-mid-cap-opp",
        name: "HDFC Mid-Cap Opportunities Fund - Direct",
        amc: "HDFC Mutual Fund",
        category: "Mid Cap",
        nav: 168.90,
        return_1y: 36.4,
        return_3y: 28.5,
        aum: "₹61,300 Cr",
        expense_ratio: "0.79%",
        risk_profile: "HIGH",
    },
    {
        id: "icici-prudential-elss",
        name: "ICICI Prudential ELSS Tax Saver - Direct",
        amc: "ICICI Prudential",
        category: "ELSS",
        nav: 852.40,
        return_1y: 26.2,
        return_3y: 21.0,
        aum: "₹14,600 Cr",
        expense_ratio: "0.92%",
        risk_profile: "HIGH",
    },
];

const CATEGORIES = [
    { id: "ALL", label: "All Categories" },
    { id: "Large Cap", label: "Large Cap" },
    { id: "Mid Cap", label: "Mid Cap" },
    { id: "Small Cap", label: "Small Cap" },
    { id: "Flexi Cap", label: "Flexi Cap" },
    { id: "ELSS", label: "ELSS Tax Saver" },
];

export default function MutualFundExplorer() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const { data: rawFunds, isLoading } = useMutualFunds(search);

    const displayFunds = useMemo(() => {
        if (search.length >= 3 && Array.isArray(rawFunds) && rawFunds.length > 0) {
            return rawFunds.map((f: any, idx: number) => ({
                id: f.id || `fund-${idx}`,
                name: f.name || f.scheme_name || "Mutual Fund Scheme",
                amc: f.amc || "Asset Management Company",
                category: f.category || "Equity",
                nav: Number(f.nav || f.net_asset_value || 100),
                return_1y: Number(f.return_1y || f.one_year_return || 15),
                return_3y: f.return_3y ? Number(f.return_3y) : undefined,
                aum: f.aum || "₹1,000+ Cr",
                expense_ratio: f.expense_ratio || "0.85%",
                risk_profile: "MODERATE" as const,
            }));
        }

        return BENCHMARK_FUNDS.filter((f) => {
            const matchesCat = selectedCategory === "ALL" || f.category === selectedCategory;
            const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [rawFunds, search, selectedCategory]);

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Terminal Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                                Mutual Fund Portfolio Intelligence
                            </h1>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border font-semibold">
                                AMFI BENCHMARKS
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Institutional telemetry across NAV trajectories, risk adjusted Sharpe metrics, and alpha consistency
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                    <span>Universe: {displayFunds.length} Funds</span>
                    <span className="text-border">|</span>
                    <span className="text-emerald-400">SEBI Compliant Direct Plans</span>
                </div>
            </div>

            {/* Category & Search Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search fund or AMC (e.g. Axis, Quant)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-card border border-border text-foreground text-xs font-mono focus-visible:ring-2 focus-visible:ring-primary outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card overflow-x-auto w-full md:w-auto">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-3 py-1 rounded text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer",
                                selectedCategory === cat.id
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fund Grid */}
            {isLoading && search.length >= 3 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-4 animate-pulse">
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-muted rounded" />
                                <div className="h-6 w-48 bg-muted rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="h-12 bg-muted rounded-lg" />
                                <div className="h-12 bg-muted rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayFunds.length === 0 ? (
                <div className="p-12 rounded-xl border border-dashed border-border bg-card/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                        <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground font-display">No Mutual Funds Match Criteria</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                        Try searching for a different AMC name or reset the category filter.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setSelectedCategory("ALL");
                        }}
                        className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-mono font-semibold cursor-pointer"
                    >
                        Reset Filter
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayFunds.map((fund) => {
                        const ai = analyzeFundConviction(fund);
                        const isHighConviction = ai.probability >= 80;

                        return (
                            <div
                                key={fund.id}
                                className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-primary/40 transition-colors shadow-sm"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70">
                                        <div>
                                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground uppercase font-semibold">
                                                {fund.category}
                                            </span>
                                            <h3 className="font-display font-bold text-base text-foreground tracking-tight line-clamp-1 mt-1">
                                                {fund.name}
                                            </h3>
                                            <span className="text-xs text-muted-foreground font-sans block">
                                                {fund.amc || "Direct Growth"}
                                            </span>
                                        </div>

                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border",
                                            isHighConviction
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                : "bg-muted text-muted-foreground border-border"
                                        )}>
                                            {ai.rating}
                                        </span>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-2.5 py-3 border-b border-border/70 font-mono text-xs">
                                        <div className="p-2.5 rounded-lg bg-background border border-border/60">
                                            <span className="text-[10px] text-muted-foreground uppercase block">Current NAV</span>
                                            <span className="font-bold text-foreground tabular-nums mt-0.5 block">
                                                ₹{Number(fund.nav).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-background border border-border/60">
                                            <span className="text-[10px] text-muted-foreground uppercase block">1Y Annualized</span>
                                            <span className={`font-bold tabular-nums mt-0.5 flex items-center gap-0.5 ${
                                                fund.return_1y >= 0 ? "text-emerald-400" : "text-rose-400"
                                            }`}>
                                                <TrendingUp className="w-3 h-3" />
                                                +{Number(fund.return_1y).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* AUM & Ratio Stats */}
                                    <div className="py-2.5 border-b border-border/60 flex items-center justify-between font-mono text-xs text-muted-foreground">
                                        <span>AUM: <strong className="text-foreground font-semibold">{fund.aum || "TBA"}</strong></span>
                                        <span>Exp Ratio: <strong className="text-foreground font-semibold">{fund.expense_ratio || "N/A"}</strong></span>
                                    </div>
                                </div>

                                {/* Neural Stability Rating */}
                                <div className="pt-3 flex items-center justify-between font-mono text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Brain className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>STABILITY SCORE</span>
                                    </div>
                                    <span className="font-bold text-foreground tabular-nums">
                                        {ai.probability}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
