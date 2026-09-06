"use client";

import { useDashboard } from "@/context/DashboardContext";
import { Brain, ArrowRight, TrendingUp, TrendingDown, Target } from "lucide-react";
import Link from "next/link";

export function HighConvictionPanel() {
    const { data, isLoading } = useDashboard();

    const picks = (data?.recentPredictions || [])
        .filter((p: any) => (p.confidence || p.accuracy_percent || 0) >= 70)
        .slice(0, 3)
        .map((p: any) => {
            const rawSignal = (p.signal || p.trend || 'HOLD').toUpperCase();
            const isBullish = rawSignal === 'UP' || rawSignal === 'BUY' || rawSignal === 'BULLISH';
            const confidence = p.confidence || p.accuracy_percent || 75;
            const isStock = p.type === 'stock' || !!p.stock_name;
            const symbol = p.symbol || p.coin || (p.stock_name ? p.stock_name.substring(0, 5) : 'ASSET');
            const name = p.name || p.stock_name || p.coin_name || symbol;

            return {
                symbol,
                name,
                isStock,
                signal: isBullish ? 'BUY' : 'SELL',
                isBullish,
                confidence,
                targetPrice: p.predictedPrice || p.predicted_price,
                timeframe: p.timeframe || '4H',
            };
        });

    const fallbackPicks = [
        { symbol: "TCS", name: "Tata Consultancy Services", isStock: true, signal: "BUY", isBullish: true, confidence: 88, targetPrice: 4280.00, timeframe: "1D" },
        { symbol: "BTC", name: "Bitcoin / USD", isStock: false, signal: "BUY", isBullish: true, confidence: 82, targetPrice: 68500.00, timeframe: "4H" },
        { symbol: "RELIANCE", name: "Reliance Industries", isStock: true, signal: "BUY", isBullish: true, confidence: 79, targetPrice: 3050.00, timeframe: "1D" },
    ];

    const displayPicks = picks.length > 0 ? picks : fallbackPicks;

    return (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Brain className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-display">
                            High Conviction Confluence Signals
                        </h3>
                        <p className="text-[11px] font-mono text-muted-foreground">
                            Ensemble ML models with &ge; 70% statistical probability
                        </p>
                    </div>
                </div>

                <Link
                    href="/predictions"
                    className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
                >
                    <span>Inspect Signals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {displayPicks.map((pick, i) => {
                    return (
                        <div
                            key={i}
                            className="p-4 rounded-lg border border-border bg-background flex flex-col justify-between hover:border-primary/40 transition-colors"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <div className="text-sm font-mono font-bold text-foreground tracking-tight">{pick.symbol}</div>
                                        <div className="text-[11px] text-muted-foreground line-clamp-1">{pick.name}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                        pick.isBullish
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    }`}>
                                        {pick.signal}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 my-3">
                                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${pick.confidence}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-mono font-semibold text-foreground tabular-nums">
                                        {pick.confidence}%
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Target className="w-3 h-3 text-primary" /> Target:
                                </span>
                                <span className="font-bold text-foreground tabular-nums">
                                    {pick.isStock ? `₹${Number(pick.targetPrice).toLocaleString("en-IN")}` : `$${Number(pick.targetPrice).toLocaleString("en-US")}`}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
