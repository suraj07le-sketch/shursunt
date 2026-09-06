"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Clock, ShieldCheck } from "lucide-react";

interface IndexItem {
    name: string;
    exchange: string;
    value: number;
    change: number;
    percent: number;
    status: "UP" | "DOWN";
}

const defaultIndices: IndexItem[] = [
    { name: "NIFTY 50", exchange: "NSE", value: 24850.15, change: 182.40, percent: 0.74, status: "UP" },
    { name: "SENSEX", exchange: "BSE", value: 81320.40, change: 540.20, percent: 0.67, status: "UP" },
    { name: "BANK NIFTY", exchange: "NSE", value: 51240.80, change: -110.30, percent: -0.21, status: "DOWN" },
];

export function MarketIndices() {
    // Determine Indian Market Status (09:15 - 15:30 IST, Mon-Fri)
    const marketStatus = useMemo(() => {
        const now = new Date();
        const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
        const istMinutes = (utcMinutes + 330) % 1440; // UTC+5:30
        const day = now.getUTCDay();

        const isWeekday = day >= 1 && day <= 5;
        const isMarketOpen = isWeekday && istMinutes >= 9 * 60 + 15 && istMinutes <= 15 * 60 + 30;

        return {
            isOpen: isMarketOpen,
            label: isMarketOpen ? "SESSION ACTIVE" : "EOD SETTLEMENT",
        };
    }, []);

    const { data: indices = defaultIndices } = useQuery({
        queryKey: ['market-indices-summary'],
        queryFn: async () => {
            try {
                const targetUrl = "https://stock.indianapi.in/market_indices";
                const res = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`);
                if (!res.ok) return defaultIndices;
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0) {
                    return json.slice(0, 3).map((item: any) => ({
                        name: item.name || item.index || "INDEX",
                        exchange: item.exchange || "NSE",
                        value: Number(item.price || item.current_price || item.last_price || 0),
                        change: Number(item.change || item.point_change || 0),
                        percent: Number(item.percent_change || item.pChange || 0),
                        status: (item.change >= 0 ? "UP" : "DOWN") as "UP" | "DOWN",
                    }));
                }
                return defaultIndices;
            } catch {
                return defaultIndices;
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-foreground border border-border">
                    <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-foreground">DOMESTIC INDICES</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            marketStatus.isOpen
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border border-border"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${marketStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`} />
                            {marketStatus.label}
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">NSE / BSE Cash Market & Segment Feeds</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {indices.map((idx) => {
                    const isUp = idx.status === "UP";
                    return (
                        <div
                            key={idx.name}
                            className="p-3 rounded-lg border border-border bg-background flex flex-col justify-between min-w-44"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono font-bold text-foreground tracking-tight">{idx.name}</span>
                                <span className="text-[10px] font-mono text-muted-foreground uppercase">{idx.exchange}</span>
                            </div>
                            <div className="mt-2 flex items-baseline justify-between gap-2">
                                <span className="text-sm font-bold font-mono text-foreground tabular-nums">
                                    ₹{idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className={`text-xs font-mono font-semibold flex items-center gap-0.5 tabular-nums ${
                                    isUp ? "text-emerald-400" : "text-rose-400"
                                }`}>
                                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {isUp ? "+" : ""}{idx.percent.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

