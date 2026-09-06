"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight, Activity, Terminal, TrendingUp, ShieldCheck } from "lucide-react";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import Link from "next/link";

const marqueeTickers = [
    { symbol: "NIFTY 50", price: "24,850.15", change: "+0.82%", isUp: true, market: "NSE" },
    { symbol: "SENSEX", price: "81,320.40", change: "+0.71%", isUp: true, market: "BSE" },
    { symbol: "RELIANCE", price: "₹2,980.50", change: "+1.45%", isUp: true, market: "NSE" },
    { symbol: "HDFCBANK", price: "₹1,642.10", change: "-0.38%", isUp: false, market: "NSE" },
    { symbol: "BTC/USDT", price: "$64,230.50", change: "+3.42%", isUp: true, market: "CRYPTO" },
    { symbol: "ETH/USDT", price: "$3,480.20", change: "+4.10%", isUp: true, market: "CRYPTO" },
    { symbol: "SOL/USDT", price: "$145.80", change: "-1.20%", isUp: false, market: "CRYPTO" },
    { symbol: "TCS", price: "₹4,150.00", change: "+0.92%", isUp: true, market: "NSE" },
];

export function HeroSection() {
    return (
        <div className="relative pt-28 pb-12 bg-background border-b border-border/60 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_20%_20%,rgba(245,158,11,0.06),transparent)]" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Core Value Proposition (7 cols) */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-muted-foreground uppercase tracking-wider font-semibold">Terminal Engine v3.2</span>
                            <span className="text-border">|</span>
                            <span className="text-primary font-bold">NSE / BSE & Crypto Live</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-foreground font-display leading-[1.08]">
                            Predictive intelligence for <span className="text-primary">disciplined traders</span>.
                        </h1>

                        <p className="text-base sm:text-lg text-muted-foreground max-w-xl font-normal leading-relaxed">
                            Institutional-grade ML models, 8-factor signal confluence, and automated risk parameters across 500+ Indian equities and 1,000+ crypto pairs.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link href="/login">
                                <button className="px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide transition-all hover:opacity-90 active:scale-[0.98] flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20">
                                    <Zap className="w-4 h-4 fill-current" />
                                    <span>Access Trading Terminal</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>

                            <a href="#features-preview">
                                <button className="px-6 py-3.5 rounded-xl bg-card hover:bg-muted/50 border border-border text-foreground font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer">
                                    <Activity className="w-4 h-4 text-primary" />
                                    <span>Explore Signal Engine</span>
                                </button>
                            </a>
                        </div>

                        {/* Quantitative Highlights */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/80 max-w-lg font-mono">
                            <div>
                                <div className="text-2xl font-bold text-foreground tabular-nums">94.2%</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Model Confluence</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground tabular-nums">&lt; 45ms</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Execution Telemetry</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground tabular-nums">1,500+</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Tracked Instruments</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Terminal Visual Interface (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-2xl space-y-4 backdrop-blur-md">
                            {/* Window Topbar */}
                            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                    <span className="ml-2 font-semibold text-foreground">SHURSUNT-CLI v3.2</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>CONNECTED</span>
                                </div>
                            </div>

                            {/* Simulated Feed Rows */}
                            <div className="space-y-2.5 font-mono text-xs">
                                <div className="p-3 rounded-lg bg-background border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                                            <Terminal className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-foreground">NIFTY 50 (OCT FUT)</span>
                                            <span className="text-[10px] text-muted-foreground block">Breakout Alert • Confluence 89%</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-emerald-400 font-bold tabular-nums">24,912.40</span>
                                        <span className="text-[10px] text-emerald-500 block">+0.88%</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-background border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-foreground">BTC/USDT (PERP)</span>
                                            <span className="text-[10px] text-muted-foreground block">Mean Reversion • Multi-TF Align</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-emerald-400 font-bold tabular-nums">$64,320.00</span>
                                        <span className="text-[10px] text-emerald-500 block">+3.42%</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-background border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded bg-rose-500/10 text-rose-400">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-foreground">RELIANCE (EQ)</span>
                                            <span className="text-[10px] text-muted-foreground block">Dynamic Stop Loss • Trailing ATR</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-foreground font-bold tabular-nums">₹2,980.50</span>
                                        <span className="text-[10px] text-muted-foreground block">SL: ₹2,942.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Execution Log */}
                            <div className="p-3 rounded-lg bg-background/60 border border-border/80 font-mono text-[11px] text-muted-foreground space-y-1">
                                <div className="flex justify-between">
                                    <span>[09:15:02] Engine initialized. Ingesting NSE ticks.</span>
                                    <span className="text-emerald-400">OK</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>[09:15:04] Orderbook depth loaded for 500 equities.</span>
                                    <span className="text-emerald-400">OK</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>[09:15:07] Neural signal generated for 14 instruments.</span>
                                    <span className="text-primary font-bold">READY</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marquee Ticker Bar */}
            <div className="mt-12 border-t border-b border-border bg-card/40 py-2.5 overflow-hidden group">
                <div className="flex w-max animate-marquee gap-8 group-hover:[animation-play-state:paused]">
                    {[...marqueeTickers, ...marqueeTickers].map((ticker, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                            <span className="font-bold text-foreground">{ticker.symbol}</span>
                            <span className="text-muted-foreground text-[10px] bg-muted px-1.5 py-0.2 rounded border border-border uppercase">
                                {ticker.market}
                            </span>
                            <span className="text-foreground font-medium tabular-nums">{ticker.price}</span>
                            <span className={`tabular-nums font-semibold ${ticker.isUp ? "text-emerald-400" : "text-rose-400"}`}>
                                {ticker.change}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
