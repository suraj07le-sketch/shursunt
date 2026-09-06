"use client";

import { useState } from "react";
import { Bell, BellOff, Brain, Clock, TrendingDown, TrendingUp, Target, ShieldAlert, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Prediction } from "@/types/prediction";
import { toast } from "sonner";
import AssetIcon from "@/components/dashboard/AssetIcon";

interface PredictionCardProps {
    pred: Prediction;
    isStock: boolean;
    onRepredict?: () => void;
    isGenerating?: boolean;
}

export function PredictionCard({ pred, isStock, onRepredict, isGenerating }: PredictionCardProps) {
    const [monitorEnabled, setMonitorEnabled] = useState(false);
    const symbol = (pred.stock_name || pred.coin || pred.name || "ASSET").toUpperCase();

    const normalizedTrend = (pred.trend || pred.signal || "HOLD").toUpperCase();
    const isBullish = normalizedTrend === "UP" || normalizedTrend === "BUY";
    const isBearish = normalizedTrend === "DOWN" || normalizedTrend === "SELL";

    const currentPrice = Number(pred.current_price || 0);
    const targetPrice = Number(pred.predicted_price || 0);
    const stopLoss = Number(pred.stop_loss_price || (isBullish ? currentPrice * 0.98 : currentPrice * 1.02));
    const confidence = Math.round(Number(pred.confidence || pred.accuracy_percent || 75));

    // Calculate upside / downside and Risk-Reward ratio
    const priceDiff = targetPrice - currentPrice;
    const changePercent = currentPrice > 0 ? (priceDiff / currentPrice) * 100 : 0;
    const riskDiff = Math.abs(currentPrice - stopLoss);
    const rewardDiff = Math.abs(targetPrice - currentPrice);
    const riskReward = riskDiff > 0 ? (rewardDiff / riskDiff).toFixed(1) : "2.0";

    const formatPrice = (val: number) => {
        return isStock
            ? `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatTimestamp = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "N/A";
            return format(d, "MMM d, HH:mm");
        } catch {
            return "N/A";
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-sm">
            {/* Header: Identity, Signal & Actions */}
            <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                            <AssetIcon
                                asset={{ id: symbol, symbol, name: symbol } as any}
                                size={28}
                                type={isStock ? "stock" : "crypto"}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-mono font-bold text-base text-foreground tracking-tight">
                                    {symbol}
                                </h3>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground uppercase font-semibold">
                                    {pred.timeframe || "4H"}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground font-sans truncate block max-w-[150px]">
                                {pred.name || symbol}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase flex items-center gap-1 ${
                            isBullish
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isBearish
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                            {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : isBearish ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                            <span>{normalizedTrend}</span>
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                setMonitorEnabled(!monitorEnabled);
                                toast.info(monitorEnabled ? "Alert monitoring deactivated" : "Alert monitoring armed for " + symbol);
                            }}
                            className={`p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                                monitorEnabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-background hover:bg-muted"
                            }`}
                            title="Toggle Price Alerts"
                        >
                            {monitorEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                        </button>

                        {onRepredict && (
                            <button
                                type="button"
                                onClick={onRepredict}
                                disabled={isGenerating}
                                className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                                title="Recalculate AI Model"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-primary" : ""}`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Model Confluence Gauge Bar */}
                <div className="py-3 border-b border-border/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Brain className="w-3.5 h-3.5 text-indigo-400" />
                            <span>CONFLUENCE SCORE</span>
                        </span>
                        <span className="font-bold text-foreground tabular-nums">
                            {confidence}%
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                confidence >= 80 ? "bg-indigo-500" : confidence >= 65 ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${confidence}%` }}
                        />
                    </div>
                </div>

                {/* Execution Price Matrix (Entry, Target, Stop Loss) */}
                <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/70 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-background border border-border/60">
                        <div className="text-[10px] text-muted-foreground uppercase">Current</div>
                        <div className="text-foreground font-bold tabular-nums mt-0.5">
                            {formatPrice(currentPrice)}
                        </div>
                    </div>

                    <div className="p-2 rounded-lg bg-background border border-border/60">
                        <div className={`text-[10px] uppercase flex items-center justify-between ${
                            changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                            <span>Target</span>
                            <span className="font-bold tabular-nums">{changePercent >= 0 ? "+" : ""}{changePercent.toFixed(1)}%</span>
                        </div>
                        <div className={`font-bold tabular-nums mt-0.5 ${
                            changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                            {formatPrice(targetPrice)}
                        </div>
                    </div>

                    <div className="p-2 rounded-lg bg-background border border-border/60">
                        <div className="text-[10px] text-rose-400/80 uppercase">Stop Loss</div>
                        <div className="text-foreground font-bold tabular-nums mt-0.5">
                            {formatPrice(stopLoss)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Telemetry */}
            <div className="pt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-primary" />
                    <span>R:R 1 : {riskReward}</span>
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(pred.predicted_time || pred.created_at)}</span>
                </span>
            </div>
        </div>
    );
}
