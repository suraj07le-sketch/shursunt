"use client";

import React from "react";
import { DollarSign, Brain, Activity, Clock, TrendingUp } from "lucide-react";

interface FeatureItem {
    area: string;
    icon: React.ReactNode;
    title: string;
    tag: string;
    description: string;
    highlight?: string;
}

const features: FeatureItem[] = [
    {
        area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
        icon: <DollarSign className="h-4 w-4 text-primary" />,
        title: "NSE/BSE & Global Crypto",
        tag: "MULTI-ASSET",
        description: "Unified access to 500+ Indian equities and 1,000+ crypto pairs with normalized order-book depth.",
        highlight: "Real-time tick pipeline",
    },
    {
        area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
        icon: <Brain className="h-4 w-4 text-indigo-400" />,
        title: "AI Confluence Signals",
        tag: "INTELLIGENCE",
        description: "Dynamic confidence scoring across EMA momentum, VWAP deviation, and pattern clustering.",
        highlight: "Calibrated 0-100% confidence",
    },
    {
        area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
        icon: <Activity className="h-4 w-4 text-emerald-400" />,
        title: "Sub-Second Live Feeds",
        tag: "LATENCY",
        description: "High-frequency quote streaming without synthetic jitter or artificial UI throttling.",
        highlight: "< 45ms end-to-end",
    },
    {
        area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
        icon: <Clock className="h-4 w-4 text-amber-400" />,
        title: "Deterministic Alerts",
        tag: "MONITORING",
        description: "Instant triggers when prices reach confluence targets, support breaches, or volatility breakouts.",
        highlight: "Zero false-positive noise",
    },
    {
        area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
        icon: <TrendingUp className="h-4 w-4 text-primary" />,
        title: "Institutional Charting",
        tag: "ANALYTICS",
        description: "Lightweight, responsive TradingView canvas with 100+ indicators, volume profiles, and drawing tools.",
        highlight: "Native TradingView sync",
    },
];

export function GlowingFeatures() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full max-w-7xl mx-auto">
            {features.map((feature, idx) => (
                <div
                    key={idx}
                    className={`p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors flex flex-col justify-between ${feature.area}`}
                >
                    <div>
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="p-2.5 rounded-lg bg-muted border border-border text-foreground">
                                {feature.icon}
                            </div>
                            <span className="text-[10px] font-mono font-semibold tracking-wider text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                                {feature.tag}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-foreground font-display mb-2">
                            {feature.title}
                        </h3>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                        </p>
                    </div>

                    {feature.highlight && (
                        <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                            <span className="text-muted-foreground">Key Spec:</span>
                            <span className="text-foreground font-semibold tabular-nums">{feature.highlight}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
