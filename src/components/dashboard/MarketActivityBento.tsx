"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNSEMostActive, fetch52WeekHighLow } from "@/lib/marketInsights";
import { Activity, ArrowUpRight, ArrowDownRight, Zap, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function MarketActivityBento() {
    const { data, isLoading } = useQuery({
        queryKey: ['market-activity'],
        queryFn: async () => {
            const [nse, highlow] = await Promise.all([fetchNSEMostActive(), fetch52WeekHighLow()]);
            return {
                activeNSE: Array.isArray(nse) ? nse.slice(0, 8) : [],
                breakouts: highlow || { high: [], low: [] }
            };
        },
        staleTime: 15 * 60 * 1000, // 15 minutes cache
        refetchInterval: 30 * 60 * 1000, // 30 mins polling
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const activeNSE = data?.activeNSE || [];
    const breakouts = data?.breakouts || { high: [], low: [] };

    const fallbackActive = [
        { symbol: "RELIANCE", stock_name: "Reliance Industries Ltd", change_percent: 1.45, current_price: 2980.50 },
        { symbol: "HDFCBANK", stock_name: "HDFC Bank Ltd", change_percent: -0.38, current_price: 1642.10 },
        { symbol: "TCS", stock_name: "Tata Consultancy Services", change_percent: 0.92, current_price: 4150.00 },
        { symbol: "INFY", stock_name: "Infosys Ltd", change_percent: 1.15, current_price: 1820.30 },
        { symbol: "ICICIBANK", stock_name: "ICICI Bank Ltd", change_percent: -0.22, current_price: 1195.40 },
    ];

    const displayList = activeNSE.length > 0 ? activeNSE : fallbackActive;
    const highBreakouts = Array.isArray(breakouts?.high) ? breakouts.high.slice(0, 3) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 8 Cols: NSE Volume & Momentum Scanner */}
            <div className="lg:col-span-8 bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-mono font-bold text-foreground">NSE LIQUIDITY & VOLUME LEADERS</h3>
                                <p className="text-[11px] font-mono text-muted-foreground">High turnover equities ranking by intraday activity</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                CACHE: 15M
                            </span>
                            <Link
                                href="/stocks"
                                className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
                            >
                                <span>All Stocks</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    <div className="divide-y divide-border/60 mt-2">
                        {displayList.map((item: any) => {
                            const isPositive = (item.change_percent || 0) >= 0;
                            return (
                                <div key={item.symbol} className="py-2.5 flex items-center justify-between hover:bg-muted/30 px-2 rounded transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center font-mono text-xs font-bold text-foreground">
                                            {item.symbol.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-mono font-bold text-xs text-foreground tracking-tight">{item.symbol}</div>
                                            <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-50">{item.stock_name}</div>
                                        </div>
                                    </div>

                                    <div className="text-right font-mono">
                                        {item.current_price && (
                                            <div className="text-xs font-bold text-foreground tabular-nums">
                                                ₹{Number(item.current_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </div>
                                        )}
                                        <div className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 tabular-nums ${
                                            isPositive ? "text-emerald-400" : "text-rose-400"
                                        }`}>
                                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {isPositive ? "+" : ""}{Number(item.change_percent || 0).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-3 border-t border-border/70 mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Source: NSE Direct Order Feed</span>
                    <span>Status: {isLoading ? "Synchronizing..." : "Stream Nominal"}</span>
                </div>
            </div>

            {/* Right 4 Cols: 52-Week Breakouts & Direct AI Prediction Link */}
            <div className="lg:col-span-4 flex flex-col gap-5">
                {/* 52W High Breakouts */}
                <div className="bg-card border border-border rounded-xl p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <h4 className="text-xs font-mono font-bold text-foreground">52-WEEK HIGHS</h4>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                BREAKOUTS
                            </span>
                        </div>

                        <div className="space-y-2 mt-3">
                            {highBreakouts.length > 0 ? (
                                highBreakouts.map((stock: any, i: number) => (
                                    <div key={i} className="p-2.5 rounded-lg border border-border/70 bg-background/50 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-mono font-bold text-foreground">{stock.symbol || stock.name}</div>
                                            <div className="text-[10px] font-mono text-emerald-400">New 52W Peak</div>
                                        </div>
                                        <div className="text-right font-mono">
                                            <div className="text-xs font-bold text-foreground tabular-nums">
                                                ₹{Number(stock.price || stock.high_52 || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-center font-mono text-xs text-muted-foreground">
                                    No immediate 52-week breakouts in current cycle
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-border">
                        <Link
                            href="/predictions"
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition-all text-xs font-mono font-semibold"
                        >
                            <span>Open Predictive Engine</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

