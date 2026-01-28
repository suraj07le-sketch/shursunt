"use client";

import { Box, Lock, Search, Settings, Sparkles, BarChart2, Zap, Shield, TrendingUp, DollarSign } from "lucide-react";
import { GlowingEffect } from "@/components/aceternity/GlowingEffect";

export function GlowingFeatures() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2 w-full max-w-7xl mx-auto p-4">
            {/* Feature 1: AI Analysis */}
            <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />}
                title="AI-Powered Analysis"
                description="Our models analyze market sentiment and technical indicators in real-time."
            />

            {/* Feature 2: Advanced Charts */}
            <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                icon={<BarChart2 className="h-4 w-4 text-black dark:text-neutral-400" />}
                title="Pro-Level Charting"
                description="Integrated TradingView charts with custom overlays and indicators."
            />

            {/* Feature 3: Security */}
            <GridItem
                area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                icon={<Shield className="h-4 w-4 text-black dark:text-neutral-400" />}
                title="Bank-Grade Security"
                description="Enterprise encryption ensuring your data is always safe."
            />

            {/* Feature 4: Lightning Fast */}
            <GridItem
                area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                icon={<Zap className="h-4 w-4 text-black dark:text-neutral-400" />}
                title="50ms Latency"
                description="Global edge network ensures you never miss a tick."
            />

            {/* Feature 5: Real-time Data */}
            <GridItem
                area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                icon={<Search className="h-4 w-4 text-black dark:text-neutral-400" />}
                title="Real-time Scanners"
                description="Instant alerts for breakouts, volume spikes, and unusual activity."
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
            <div className="relative h-full rounded-2xl border border-white/10 p-2 md:rounded-3xl md:p-3 bg-white/5 backdrop-blur-sm group overflow-hidden">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    className="group-hover:opacity-100 opacity-0 transition-opacity duration-300"
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] bg-black/50 backdrop-blur-md z-10">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border border-gray-600 p-2 bg-black">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                                {title}
                            </h3>
                            <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};
