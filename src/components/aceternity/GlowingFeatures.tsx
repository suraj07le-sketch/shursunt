"use client";

import { Box, Lock, Search, Settings, Sparkles, BarChart2, Zap, Shield, TrendingUp, DollarSign, TrendingUpIcon, Activity, Brain, Clock } from "lucide-react";
import { GlowingEffect } from "@/components/aceternity/GlowingEffect";

export function GlowingFeatures() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2 w-full max-w-7xl mx-auto p-4">
            {/* Feature 1: Crypto & Stocks */}
            <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<DollarSign className="h-4 w-4 text-foreground" />}
                title="Crypto & Stocks"
                description="Real-time data from 40+ exchanges including Bitcoin, Ethereum, and Indian stocks."
            />

            {/* Feature 2: AI Predictions */}
            <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                icon={<Brain className="h-4 w-4 text-foreground" />}
                title="AI Predictions"
                description="Advanced neural networks analyze market patterns to predict trends."
            />

            {/* Feature 3: Real-time Data */}
            <GridItem
                area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                icon={<Activity className="h-4 w-4 text-foreground" />}
                title="Live Market Data"
                description="Lightning-fast updates with sub-second latency across all markets."
            />

            {/* Feature 4: Price Alerts */}
            <GridItem
                area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                icon={<Clock className="h-4 w-4 text-foreground" />}
                title="Smart Alerts"
                description="Get notified instantly when prices hit your target or patterns emerge."
            />

            {/* Feature 5: Technical Analysis */}
            <GridItem
                area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                icon={<TrendingUpIcon className="h-4 w-4 text-foreground" />}
                title="Technical Analysis"
                description="Professional charts with 100+ indicators and drawing tools."
            />
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={`min-h-[14rem] list-none ${area}`}>
            <div className="relative h-full rounded-2xl border border-border p-2 md:rounded-3xl md:p-3 bg-card/50 backdrop-blur-sm group overflow-hidden">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 text-primary"
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 shadow-xl bg-card z-10">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border border-border p-2 bg-muted/20">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-foreground md:text-2xl/[1.875rem]">
                                {title}
                            </h3>
                            <h2 className="font-sans text-sm/[1.125rem] text-muted-foreground md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

