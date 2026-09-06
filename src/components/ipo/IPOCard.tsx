"use client";

import { useState } from "react";
import { Activity, Info } from "lucide-react";
import { IPOSubscription, predictIPOGains } from "@/lib/ipoLogic";
import { IPODetailModal } from "./IPODetailModal";
import { cn } from "@/lib/utils";

interface IPOCardProps {
    ipo: {
        company_name: string;
        issue_price_raw: string;
        issue_size: string;
        listing_date: string;
        open_date: string;
        close_date: string;
        status: "open" | "upcoming" | "closed" | "listed";
        subscription?: IPOSubscription | string;
        gmp?: number | string;
        type?: "mainboard" | "sme";
        additional_text?: string;
        document_url?: string;
        financials?: {
            revenue?: string;
            pat?: string;
            pe?: string;
            lot_size?: number;
        };
        listing_price_est?: number;
        source?: string;
        updated_at?: string;
        logo_url?: string;
    };
    onSelect?: () => void;
}

export function IPOCard({ ipo, onSelect }: IPOCardProps) {
    const [localModalOpen, setLocalModalOpen] = useState(false);

    // Parse numeric issue price for neural forecast
    const priceNum = parseFloat(ipo.issue_price_raw.replace(/[^0-9.]/g, '')) || 500;
    const numericGmp = typeof ipo.gmp === 'number' ? ipo.gmp : parseFloat(`${ipo.gmp}`.replace(/[^0-9.]/g, '')) || 0;

    // Parse issue size in Cr for size scaling vector
    const sizeNumCr = parseFloat(ipo.issue_size.replace(/[^0-9.]/g, '')) || undefined;

    const prediction = predictIPOGains({
        company_name: ipo.company_name,
        issue_price: priceNum,
        subscription: typeof ipo.subscription === 'object' ? ipo.subscription : undefined,
        gmp: numericGmp,
        status: ipo.status,
        issue_size_cr: sizeNumCr,
        is_sme: ipo.type === 'sme',
        listing_price_est: ipo.listing_price_est
    });

    const isBullish = prediction.sentiment.startsWith('BULLISH');
    const isMainboard = ipo.type !== "sme";

    // Format subscription string
    const subscriptionDisplay = typeof ipo.subscription === 'string'
        ? ipo.subscription
        : ipo.subscription?.total
        ? `${ipo.subscription.total}x`
        : "Pending";

    const gmpDisplay = ipo.gmp
        ? typeof ipo.gmp === 'number'
            ? `+₹${ipo.gmp} (${((ipo.gmp / priceNum) * 100).toFixed(1)}%)`
            : ipo.gmp
        : "TBA";

    const handleCardClick = () => {
        if (onSelect) {
            onSelect();
        } else {
            setLocalModalOpen(true);
        }
    };

    return (
        <>
            <div 
                onClick={handleCardClick}
                className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm cursor-pointer group hover:shadow-md"
            >
                <div>
                    {/* Header: Company Logo, Name, Segment & Status */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                        <div className="flex items-start gap-3">
                            {ipo.logo_url ? (
                                <img 
                                    src={ipo.logo_url} 
                                    alt={ipo.company_name}
                                    className="w-10 h-10 rounded-xl object-contain bg-background border border-border p-1 shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0 uppercase">
                                    {ipo.company_name.slice(0, 2)}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-display font-bold text-base text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                        {ipo.company_name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground uppercase font-semibold">
                                        {isMainboard ? "MAINBOARD" : "SME"}
                                    </span>
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                        Size: {ipo.issue_size || "TBA"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border shrink-0",
                            ipo.status === "open" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            ipo.status === "upcoming" && "bg-sky-500/10 text-sky-400 border-sky-500/20",
                            ipo.status === "listed" && "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                            ipo.status === "closed" && "bg-muted text-muted-foreground border-border"
                        )}>
                            {ipo.status === "open" ? "BIDDING OPEN" : ipo.status.toUpperCase()}
                        </span>
                    </div>

                    {/* Primary Metrics */}
                    <div className="grid grid-cols-2 gap-2.5 py-3 border-b border-border/70 font-mono text-xs">
                        <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] text-muted-foreground uppercase block">Price Band</span>
                            <span className="font-bold text-foreground tabular-nums mt-0.5 block">
                                {ipo.issue_price_raw.startsWith("₹") ? ipo.issue_price_raw : `₹${ipo.issue_price_raw}`}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] text-muted-foreground uppercase block">Grey Market Premium</span>
                            <span className="font-bold text-emerald-400 tabular-nums mt-0.5 block">
                                {gmpDisplay}
                            </span>
                        </div>
                    </div>

                    {/* Chronological Milestone Timeline */}
                    <div className="py-3 border-b border-border/70 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                            CHRONOLOGICAL TIMELINE
                        </span>
                        <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                            <div className="p-2 rounded bg-background/60 border border-border/50">
                                <span className="text-[9px] text-muted-foreground uppercase block">Bidding Opens</span>
                                <span className="font-medium text-foreground tabular-nums">{ipo.open_date || "TBA"}</span>
                            </div>
                            <div className="p-2 rounded bg-background/60 border border-border/50">
                                <span className="text-[9px] text-muted-foreground uppercase block">Bidding Closes</span>
                                <span className="font-medium text-foreground tabular-nums">{ipo.close_date || "TBA"}</span>
                            </div>
                            <div className="p-2 rounded bg-background/60 border border-border/50">
                                <span className="text-[9px] text-muted-foreground uppercase block">Listing Day</span>
                                <span className="font-semibold text-primary tabular-nums">{ipo.listing_date || "TBA"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Neural Forecast Block */}
                    <div className="pt-3 flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Activity className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground block">PERCEPTRON FORECAST</span>
                                <span className={`font-bold tabular-nums ${isBullish ? "text-emerald-400" : "text-foreground"}`}>
                                    {prediction.gain_percent > 0 ? `+${prediction.gain_percent.toFixed(1)}% Est. Gain` : (prediction.sentiment === 'AWAITING_DATA' ? "Awaiting Depth Data" : `${prediction.gain_percent.toFixed(1)}% Gain`)}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">Subscription</span>
                            <span className="font-bold text-foreground tabular-nums">
                                {subscriptionDisplay}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="truncate max-w-[200px] italic font-sans text-muted-foreground/80">
                        {ipo.additional_text ? `"${ipo.additional_text}"` : "Click for deep quantitative analysis"}
                    </span>
                    <span className="text-[10px] font-semibold text-primary flex items-center gap-1 group-hover:underline">
                        <span>Details</span>
                        <Info className="w-3 h-3" />
                    </span>
                </div>
            </div>

            {/* Standalone Fallback Modal if onSelect not provided */}
            {!onSelect && (
                <IPODetailModal
                    isOpen={localModalOpen}
                    onClose={() => setLocalModalOpen(false)}
                    ipo={ipo}
                    prediction={prediction}
                />
            )}
        </>
    );
}
